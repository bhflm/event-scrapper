import { Request, Response } from 'express';
import { ethers } from 'ethers';
import { parseFeeCollectorEvents, loadFeeCollectorEvents, getLastChainBlock, parseToEventsModel } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';
import { FeeCollectorContract } from '../contracts/feeCollector';
import { getChainIdByName } from '../helpers/chain';

const BLOCKS_RANGE_THRESHOLD = 1024; //https://docs.blockpi.io/guides-for-web-3.0-users/how-to-use-blockpi/best-practices
const CHUNK_SIZE = 150;

const fetchRawEventsWithMultipleProviders = async (feeCollector: FeeCollectorContract, fromBlock: number, toBlock: number): Promise<ethers.Event[]> => {
  const blockRangeScan = toBlock - fromBlock;
  
  let rawEvents;
  try {
    if (blockRangeScan > BLOCKS_RANGE_THRESHOLD) {
      rawEvents = await loadFeeCollectorEventsInChunks(feeCollector, fromBlock + 1, toBlock);
    } else {
      rawEvents = await loadFeeCollectorEvents(feeCollector, fromBlock + 1, toBlock);
    }
  
    return rawEvents;
  } catch(err) {
    console.log('fetchRawEvents', err);
    throw Error(err);
  }
  
};

/**
 * Returns a scan over a given blockrange. If the blockrange is below the _safe_ threshold, does a single call, otherwise, it 
 * executes a chunk strategy to make multiple calls without overloading the rpc
 * 
 * @param feeCollector FeeCollectorContract
 * @param fromBlock initial block to scan from 
 * @param toBlock end block to scan to
 * @returns array of raw ethers.events[]
 */
const loadFeeCollectorEventsInChunks = async (feeCollector: FeeCollectorContract, fromBlock: number, toBlock: number): Promise<ethers.Event[]> => {
  console.log('LOAD FEE COLLECTOR EVENTS IN CHUNKS', fromBlock, toBlock);
  try {
  const chunks: number[][] = [];
  const blockRangeScan = toBlock - fromBlock;
    
  if (blockRangeScan < BLOCKS_RANGE_THRESHOLD) {
    const singleChunk = await loadFeeCollectorEvents(feeCollector, fromBlock + 1, toBlock);
    return singleChunk
  };

  for (let start = fromBlock + 1; start <= toBlock; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    chunks.push([start, end]);
  }

  const eventsPromises = chunks.map(([from, to]) => loadFeeCollectorEvents(feeCollector, from, to));
    const rawChunksResults: ethers.Event[][] = await Promise.all(eventsPromises);
    const flattenedChunkResults: ethers.Event[] = rawChunksResults.flat();
    return flattenedChunkResults;
  } catch (error) {
    console.error(`Error fetching blocks: ${error.message}`);
    throw error;
  }
};

export const fetchAndSaveLastEvents = async (req: Request, res: Response) => {
  try {
    const { body: { scanBlock, chain } } = req;

    if (!chain) {
      const missingChainParameterErrorMessage = 'Need to suply a chain name';
      console.error(missingChainParameterErrorMessage);
      res.status(400).send({ message: missingChainParameterErrorMessage });
    }

    const chainId = getChainIdByName(chain);
    const feeCollector = new FeeCollectorContract(chainId);
    const feeCollectorContract = feeCollector.getFeeCollectorInstance();

    let toBlock;

    if (!scanBlock) {
      toBlock = await getLastChainBlock(chainId);
    } else {
      toBlock = scanBlock;
    }

    const fromBlock = await feeCollectorService.getLastIndexedBlock(chainId); // + 1;

    if (toBlock <= fromBlock.lastIndexedBlock) {
      const minorBlockRangeErrorMessage = `Invalid block range: ${toBlock} Needs to be > than last indexed block`;
      console.log(minorBlockRangeErrorMessage);
      return res.status(400).send({ message: minorBlockRangeErrorMessage, lastIndexedBlock: fromBlock.lastIndexedBlock });
    }

    let rawEvents = await fetchRawEventsWithMultipleProviders(feeCollector, fromBlock.lastIndexedBlock, toBlock);

    if (rawEvents.length > 0) {
      const feeCollectorEvents = parseFeeCollectorEvents(feeCollectorContract, rawEvents);
      const events = parseToEventsModel(feeCollectorEvents, chainId);
      await feeCollectorService.createManyEvents(events);
    };
  
    await feeCollectorService.saveLastIndexedBlock(toBlock, chainId);

    return res.send({ scanned: rawEvents.length });
  } catch(error) {
    console.error('fetchAndSaveLastEvents Error: ', error);
    res.status(400).send({ error })
  }
};

export const getEventsByIntegrator = async (req: Request, res: Response) => {
  const { params: { address, chain } } = req;
  try {
    const chainId = getChainIdByName(chain);

    if (!address) {
      const missingAddressError = 'Need to supply a integrator address.';
      res.status(400).send({ message: missingAddressError }); // FIX: status code
    }
  
    const rawEventsByIntegrator = await feeCollectorService.getEventsByIntegrator(address, chainId);
  
    const events = rawEventsByIntegrator.map(({ integrator, integratorFee, token, lifiFee }) => ({ integrator, token, integratorFee, lifiFee }));
  
    res.send({ events, amount: events.length });
  } catch(error) {
    console.error('Error getEventsByIntegrator: ', error.message);
    res.status(400).send({ error });
  };
   
};

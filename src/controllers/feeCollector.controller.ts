import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { parseFeeCollectorEvents, loadFeeCollectorEvents, getLastBlockForFeeCollector, parseToEventsModel } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';
import { feeCollectorContract } from '../contracts/feeCollector';
import { getChainIdByName } from '../helpers/chain';

const BLOCKS_RANGE_THRESHOLD = 1024;
const CHUNK_SIZE = 150; 

const loadFeeCollectorEventsInChunks = async (feeCollector: ethers.Contract, fromBlock: number, toBlock: number): Promise<any> => {
  const chunks: number[][] = [];

  for (let start = fromBlock + 1; start <= toBlock; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    chunks.push([start, end]);
  }

  const promises = chunks.map(([start, end]) => loadFeeCollectorEvents(feeCollector, start, end));

  try {
    const rawChunksResults = await Promise.all(promises);
    const flattenedChunkResults = rawChunksResults.flat();
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
      const errorMessage = 'Need to suply a chain name';
      console.error(errorMessage);
      res.status(400).send({ errorMessage });
    }

    const chainId = getChainIdByName(chain);
    const feeCollector = await feeCollectorContract(chainId);

    let toBlock;


    if (!scanBlock) {
      toBlock = await getLastBlockForFeeCollector(chainId);
    } else {
      toBlock = scanBlock;
    }

    const fromBlock = await feeCollectorService.getLastIndexedBlock(chainId); // + 1;

    if (toBlock <= fromBlock.lastIndexedBlock) {
      const minorBlockRangeErrorMessage = `Invalid block range: ${toBlock} Needs to be > than last indexed block`;
      console.log(minorBlockRangeErrorMessage);
      return res.status(400).send({ message: minorBlockRangeErrorMessage, lastIndexedBlock: fromBlock.lastIndexedBlock });
    }

    let rawEvents;

    if ((toBlock - fromBlock.lastIndexedBlock) > BLOCKS_RANGE_THRESHOLD) {
      rawEvents = await loadFeeCollectorEventsInChunks(feeCollector, fromBlock.lastIndexedBlock + 1, toBlock);
    } else {
      rawEvents = await loadFeeCollectorEvents(feeCollector, fromBlock.lastIndexedBlock + 1, toBlock);
    }
    
    if (rawEvents.length > 0) {
      const feeCollectorEvents = parseFeeCollectorEvents(feeCollector, rawEvents);
      const events = parseToEventsModel(feeCollectorEvents, chainId);
      await feeCollectorService.createManyEvents(events);
    };
  
    await feeCollectorService.saveLastIndexedBlock(toBlock, chainId);

    return res.send({ scanned: rawEvents.length });
  } catch(err) {
    console.error('fetchAndSaveLastEvents Error: ', err);
    res.status(400).send({ err })
  }
};

export const getEventsByIntegrator = async (req: Request, res: Response, next: NextFunction) => {
  const { params: { address, chain } } = req;
  try {

    console.log(address, chain);
    
    const chainId = getChainIdByName(chain);

    if (!address) {
      res.status(400).send({ message: 'Need to supply a integrator address '}); // FIX: status code
    }
  
    const rawEventsByIntegrator = await feeCollectorService.getEventsByIntegrator(address, chainId);
  
    const events = rawEventsByIntegrator.map(({ integrator, integratorFee, token, lifiFee }) => ({ integrator, token, integratorFee, lifiFee }));
  
    res.send({ events, amount: events.length });
  } catch(error) {
    console.error('Error getEventsByIntegrator: ', error.message);
    res.status(400).send({ message: error.message });
  };
   
};

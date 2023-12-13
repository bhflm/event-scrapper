import { Request, Response, NextFunction } from 'express';
import { parseFeeCollectorEvents, loadFeeCollectorEvents, getLastBlockForFeeCollector, parseToEventsModel } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';
import { feeCollectorContract } from '../contracts/feeCollector';
import { getChainIdByName } from 'src/helpers/chain';

const BLOCKS_RANGE_THRESHOLD = 5000;

export const fetchAndSaveLastEvents = async (req: Request, res: Response) => {
  try {
    const { body: { scanBlock, chain } } = req;
    
    console.log('RES: ', res);

    console.log('chainSymbol: ', chain);

    const chainId = getChainIdByName(chain);

    console.log('Chain: ', chainId);

    const feeCollector = await feeCollectorContract(chainId);

    console.log('feeCollector: ', feeCollector);

    const toBlock = scanBlock; // const toBlock = to ? to : await getLastBlockForFeeCollector();
    const fromBlock = await feeCollectorService.getLastIndexedBlock(chainId); // + 1;

    console.log('fromBlock: ', fromBlock);

    if (toBlock <= fromBlock.lastIndexedBlock) {
      console.log('Invalid block range', fromBlock);
      return res.status(400).send({ message: 'Invalid block range', lastIndexedBlock: fromBlock.lastIndexedBlock });
    }

    if ((toBlock - fromBlock.lastIndexedBlock) > BLOCKS_RANGE_THRESHOLD) {
      console.log(`Invalid block range: exceeds threshold of ${BLOCKS_RANGE_THRESHOLD}`);
      return res.status(400).send({ message: 'Invalid block range to scan' });
    }
    
    const rawEvents = await loadFeeCollectorEvents(feeCollector, fromBlock.lastIndexedBlock + 1, toBlock);
    
    if (rawEvents.length > 0) {
      // store on database internally
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

  const chainId = getChainIdByName(chain);

  if (!chainId) {
    res.status(400).send({ message: `Chain ${chain} is not supported or does not exist`}); // FIX: status code
  };

  if (!address) {
    res.status(400).send({ message: 'Need to supply a integrator address '}); // FIX: status code
  }

  const rawEventsByIntegrator = await feeCollectorService.getEventsByIntegrator(address, chainId);

  const events = rawEventsByIntegrator.map(({ integrator, integratorFee, token, lifiFee }) => ({ integrator, token, integratorFee, lifiFee }));

  res.send({ events, amount: events.length });
};

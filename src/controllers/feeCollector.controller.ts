import { Request, Response, NextFunction } from 'express';
import { parseFeeCollectorEvents, loadFeeCollectorEvents, getLastBlockForFeeCollector } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';
import { feeCollectorContract } from '../contracts/feeCollector';

const BLOCKS_RANGE_THRESHOLD = 1024;

export const fetchAndSaveLastEvents = async (req: Request, res: Response, next: NextFunction) => {
  // @@ TODO: Refactor for chainId support
  try {
    const { body: { scanBlock, chainId } } = req;
    
    const feeCollector = await feeCollectorContract();
    const toBlock = scanBlock; // const toBlock = to ? to : await getLastBlockForFeeCollector();
    const fromBlock = await feeCollectorService.getLastIndexedBlock(); // + 1;

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
      const events = parseFeeCollectorEvents(feeCollector, rawEvents);
      console.log('Events: ', events);
      // @@ WIP: Store events internally.
    };
  
    await feeCollectorService.saveLastIndexedBlock(toBlock);

    return res.send({ scanned: rawEvents.length });
  } catch(err) {
    const { message } = err;
    res.status(400).send({ message })
  }
};


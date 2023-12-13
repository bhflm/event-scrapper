import { Request, Response, NextFunction } from 'express';
import { parseFeeCollectorEvents, loadFeeCollectorEvents, getLastBlockForFeeCollector, parseToEventsModel } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';
import { feeCollectorContract } from '../contracts/feeCollector';
import { getChainIdByName } from '../helpers/chain';

const BLOCKS_RANGE_THRESHOLD = 1024;

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

    let toBlock; // const toBlock = to ? to : await getLastBlockForFeeCollector();
    

    if (!scanBlock) {
      toBlock = await getLastBlockForFeeCollector(chainId);
      console.log('Fetched last block for chainId: ', chainId, toBlock);
    } else {
      toBlock = scanBlock;
      console.log('Default block param; ', scanBlock);
    }

    const fromBlock = await feeCollectorService.getLastIndexedBlock(chainId); // + 1;

    console.log('fromBlock: ', fromBlock);

    if (toBlock <= fromBlock.lastIndexedBlock) {
      const minorBlockRangeErrorMessage = `Invalid block range: ${toBlock} Needs to be > than last indexed block`;
      console.log(minorBlockRangeErrorMessage);
      return res.status(400).send({ message: minorBlockRangeErrorMessage, lastIndexedBlock: fromBlock.lastIndexedBlock });
    }

    if ((toBlock - fromBlock.lastIndexedBlock) > BLOCKS_RANGE_THRESHOLD) {
      console.log('Alternate method for scraping blocks');
      // @@ TODO: Scrape blocks with exponential backoff algorithm
      return res.json({ message: 'NEED TO IMPLEMENT' });
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

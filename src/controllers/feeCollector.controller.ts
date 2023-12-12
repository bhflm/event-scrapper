import { Router, Request, Response, NextFunction } from 'express';
import { getLastBlockForFeeCollector } from '../helpers';
import * as feeCollectorService from '../services/feeCollector.service';

export const fetchAndSaveLastEvents = async (req: Request, res: Response, next: NextFunction) => {
  // @@ TODO: Refactor for chain support
  try {
    let from, to;  
    const { body: { fromBlock, toBlock, chainId } } = req;
    
    // @@TODO: Refactor below methods to support chainId param.

    if (!fromBlock && !toBlock) {
      to = await getLastBlockForFeeCollector();
      console.log('TO: ', to);

      from = await feeCollectorService.getLastIndexedBlock();
      console.log('FROM: ', from);
    };
  
    return res.send({});
  } catch(err) {
    const { message } = err;
    res.status(400).send({ message })
  }
};


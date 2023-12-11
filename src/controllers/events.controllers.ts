import { Router, Request, Response, NextFunction } from 'express';
import { loadFeeCollectorEvents, parseFeeCollectorEvents } from '../helpers/loadEvents';

/**
 * 
 * @param req 
 * @param res  
 * @param next 
 * @returns 
 */

/* fetch events mostly indexes last retrieved events
* checks if parameters fromBlock - toBlock
* otherwise fetches from last block fetched til newest
* stores new dbs on db
*/

export const fetchFeeCollectorEvents = async (req: Request, res: Response, next: NextFunction) => {
  console.log('fetchEvents controller!');
  console.log('REQ: ', req.body);

  const fromBlock = 51009343;
  const toBlock = 51011196;

  const feeCollectorEvents = await loadFeeCollectorEvents(fromBlock, toBlock);

  return res.send({ feeCollectorEvents });
};
import * as path from 'path';
import { ethers } from 'ethers';
import { BlockTag } from '@ethersproject/abstract-provider'

const dirPath = __dirname;
const CONTRACT_ADDRESS = '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9'
const POLYGON_RPC = 'https://polygon-rpc.com'
const FEECOLLECTOR_ABI_PATH = path.join(dirPath, '..', 'contracts', 'feeCollector.abi.json');

interface ParsedFeeCollectedEvents {
  token: string; // the address of the token that was collected
  integrator: string; // the integrator that triggered the fee collection
  integratorFee: ethers.BigNumberish; // the share collector for the integrator
  lifiFee: ethers.BigNumberish; // the share collected for lifi
}

export const getLastBlockForFeeCollector = async () => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
    const lastBlock = await provider.getBlockNumber();
    
    return lastBlock;
  } catch (error) {
    console.error('Error fetching last block from contract:', error.message);
  }
}

/**
 * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
 * Throws if exceeds maximum block range
 * https://github.com/bnb-chain/bsc/issues/113 
 * https://ethereum.stackexchange.com/questions/107590/contract-queryfilterfilter-giving-me-errors-in-ethers-js
 * 
 * @param fromBlock
 * @param toBlock
 */


const MAX_BLOCK_RANGE = 5000; // for contract.queryFilter, throws whenever range is > 5000
const SAFE_BLOCK_RANGE = 1024; // https://docs.blockpi.io/guides-for-web-3.0-users/how-to-use-blockpi/best-practices

export const loadFeeCollectorEvents = async (feeCollectorContract: ethers.Contract, fromBlock: BlockTag, toBlock: BlockTag): Promise<ethers.Event[]> => {
  try {


    const blockRange =  parseInt(toBlock.toString(), 10) - parseInt(fromBlock.toString(), 10) ;

    console.log('block RANGE: ', blockRange);

    if (blockRange >= SAFE_BLOCK_RANGE) {
      throw Error(`Cannot exceed maximum block range: ${SAFE_BLOCK_RANGE}`);
    }

    const filter = feeCollectorContract.filters.FeesCollected();
    console.log('Filter: ', filter);
    const events = await feeCollectorContract.queryFilter(filter, fromBlock, toBlock);
    console.log('Events: ', events);
    return events;
  } catch (err) {
    console.log('Error: ', err);
    throw new Error(err);
  }
}

/**
 * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
 * @param events
 */
export const parseFeeCollectorEvents = (
  feeCollectorContract: ethers.Contract,
  events: (ethers.Event)[],
): any[] => {

  return events.map(event => {
    console.log(event);
    const { topics, data } = event; 

    const parsedEvent = feeCollectorContract.interface.parseLog({ topics, data })

    const feesCollected: ParsedFeeCollectedEvents = {
      token: parsedEvent.args[0],
      integrator: parsedEvent.args[1],
      integratorFee: ethers.BigNumber.from(parsedEvent.args[2]),
      lifiFee: ethers.BigNumber.from(parsedEvent.args[3]),
    };
    
    return feesCollected;
  })
}

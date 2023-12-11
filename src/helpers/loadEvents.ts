import * as fsPromises from 'fs/promises';
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

async function getAbi(abiFilePath): Promise<any> {
  const data = await fsPromises.readFile(abiFilePath, 'utf-8');
  return JSON.parse(data);
};


/**
 * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
 * @param fromBlock
 * @param toBlock
 */
export const loadFeeCollectorEvents = async (fromBlock: BlockTag, toBlock: BlockTag): Promise<any> => {
  try {
    const feeCollectorABI = await getAbi(FEECOLLECTOR_ABI_PATH);
    console.log(feeCollectorABI);

    const contractInterface = new ethers.utils.Interface(feeCollectorABI);
  
    const feeCollector = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractInterface,
      new ethers.providers.JsonRpcProvider(POLYGON_RPC)
    );
      
    const filter = feeCollector.filters.FeesCollected()
    const events = await feeCollector.queryFilter(filter, fromBlock, toBlock);

    return parseFeeCollectorEvents(feeCollector, events);
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

    console.log('Parsed Event: ', parsedEvent);

    const feesCollected: ParsedFeeCollectedEvents = {
      token: parsedEvent.args[0],
      integrator: parsedEvent.args[1],
      integratorFee: ethers.BigNumber.from(parsedEvent.args[2]),
      lifiFee: ethers.BigNumber.from(parsedEvent.args[3]),
    };

    console.log('Parsed feesCollected: ', parsedEvent);

    const integratorFeeString = feesCollected.integratorFee.toString();
    
    console.log('integratorFeeString: ', integratorFeeString);

    console.log('back to bigNumber', ethers.BigNumber.from(integratorFeeString));

    return feesCollected;
  })
}

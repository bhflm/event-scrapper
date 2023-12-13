import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { ethers } from 'ethers';
import { getRpcProvider } from 'src/helpers/chain';
const dirPath = __dirname;

const FEECOLLECTOR_ABI_PATH = path.join(dirPath, '..', 'contracts', 'feeCollector.abi.json'); // @todo: save this a string ??? sdk does it

const CONTRACT_ADDRESS = '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9'

/**
 * Loads a contract abi.json
 * @param abiFilePath
 */
const getAbi = async (abiFilePath) => {
  const data = await fsPromises.readFile(abiFilePath, 'utf-8');
  return JSON.parse(data);
};

export const feeCollectorContract = async (chainId: number) => {
  try { 
    const feeCollectorABI = await getAbi(FEECOLLECTOR_ABI_PATH); // @@ todo: Refactor this as string
    const contractInterface = new ethers.utils.Interface(feeCollectorABI);
    const rpcUrl = getRpcProvider(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  
    const feeCollector = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractInterface,
      provider,
    );
  
    return feeCollector;
  } catch(err) {
    console.error('Error while retrieving Fee Collector Contract: ', err.message);
    return err;
  }
}

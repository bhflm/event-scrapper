import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { ethers } from 'ethers';

const dirPath = __dirname;
const CONTRACT_ADDRESS = '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9'
const POLYGON_RPC = 'https://polygon-rpc.com'
const FEECOLLECTOR_ABI_PATH = path.join(dirPath, '..', 'contracts', 'feeCollector.abi.json');

/**
 * Loads a contract abi.json
 * @param abiFilePath
 */
const getAbi = async (abiFilePath) => {
  const data = await fsPromises.readFile(abiFilePath, 'utf-8');
  return JSON.parse(data);
};

export const feeCollectorContract = async () => {

  const feeCollectorABI = await getAbi(FEECOLLECTOR_ABI_PATH);

  const contractInterface = new ethers.utils.Interface(feeCollectorABI);

  const feeCollector = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractInterface,
    new ethers.providers.JsonRpcProvider(POLYGON_RPC)
  );

  return feeCollector;
}

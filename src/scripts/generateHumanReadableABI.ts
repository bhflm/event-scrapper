import * as fsPromises from 'fs/promises';
import { ethers } from 'ethers';

const getAbi = async (abiFilePath) => {
  const data = await fsPromises.readFile(abiFilePath, 'utf-8');
  return JSON.parse(data);
}


/**
 * Generates a human readable abi from a abi.json file - motive behind is not to file load every time the contract abi.json
 * @param abiPath Path to the feeCollector.abi.json
 * @returns ethers.utils.Interface
 */
const humanReadable = async (abiPath: string) => {
  const jsonAbi = await getAbi(abiPath); // @@ todo: Refactor this as string
  const iface = new ethers.utils.Interface(jsonAbi);
  return iface;
};
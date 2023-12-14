import { ethers } from 'ethers';
import { getRpcProvider } from '../helpers/chain';
import { CONTRACT_ADDRESS, feeCollectorABI } from './constants';

export const feeCollectorContract = async (chainId: number) => {
  try {
    const contractInterface = new ethers.utils.Interface(feeCollectorABI);
    const rpcUrl = getRpcProvider(chainId);
    console.log('RPC URL :', rpcUrl);
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
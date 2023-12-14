import { ethers } from 'ethers';
import { getRpcProvider } from '../helpers/chain';
import { CONTRACT_ADDRESS, feeCollectorABI } from './constants';
export class FeeCollectorContract {
  private feeCollector: ethers.Contract;
  private chainId: number;

  constructor(private chain: number) {
    this.chainId = chain;
    this.initializeFeeCollector();
  }

  private initializeFeeCollector(): void {
    try {
      const contractInterface = new ethers.utils.Interface(feeCollectorABI);
      const rpcUrl = getRpcProvider(this.chainId);

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      this.feeCollector = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractInterface,
      provider,
    );

    } catch (err) {
      console.error('Error while initializing Fee Collector Contract: ', err.message);
      throw err;
    }
  }


  public getFeeCollectorInstance(): ethers.Contract {
    return this.feeCollector;
  }
};
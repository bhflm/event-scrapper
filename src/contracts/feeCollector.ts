import { ethers } from 'ethers';
import { getRpcProviders } from '../helpers/chain';
import { CONTRACT_ADDRESS, feeCollectorABI } from './constants';
export class FeeCollectorContract {
  private feeCollector: ethers.Contract;
  private chainId: number;
  private currentProvider: string;
  private providerIndex: number;
  private rpcProviders: string[];

  constructor(private chain: number) {
    this.chainId = chain;
    this.initializeFeeCollector();
  }

  private initializeFeeCollector(): void {
    try {
      const contractInterface = new ethers.utils.Interface(feeCollectorABI);
      const chainProviders = getRpcProviders(this.chainId);

      this.rpcProviders = chainProviders;
      this.providerIndex = 0;
      this.currentProvider = this.rpcProviders[this.providerIndex];      

      const provider = new ethers.providers.JsonRpcProvider(this.currentProvider);

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


  private updateFeeCollectorProvider(): void {
    try {
      let nextProviderIndex = this.providerIndex + 1;
      console.log('NextPRovider: ', nextProviderIndex);
      if (!this.rpcProviders[nextProviderIndex]) { // we did go through all the providers array;
        nextProviderIndex = 0;
        console.log('NextPRovider: ', nextProviderIndex);
      }
      const newRpcUrl = this.rpcProviders[nextProviderIndex];
      const newProvider = new ethers.providers.JsonRpcProvider(newRpcUrl);
      this.feeCollector = this.feeCollector.connect(newProvider);
      this.currentProvider = newRpcUrl;
      this.providerIndex = nextProviderIndex;
      console.log('new provider')
    } catch(err) {
      console.error('Error while updating provider');
      return err;
    }
    
  }

  public changeRpcProvider(): void {
    this.updateFeeCollectorProvider();
  }

  public getFeeCollectorInstance(): ethers.Contract {
    return this.feeCollector;
  }
};
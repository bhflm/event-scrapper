import { ChainRpcProviders, ChainIds } from "../types/chains";

export const getRpcProvider = (chainId: number) => {
  if (!ChainRpcProviders[chainId]) {
    throw new Error(`Unable to configure provider for chain ${chainId}.`)
  }

  const rpcUrl = ChainRpcProviders[chainId]
  console.log('RPC URL: ', rpcUrl);

  return rpcUrl;
};

export const getChainIdByName = (chain: string) => {
  if(!ChainIds[chain]){
    throw new Error(`Chain ${chain} does not exist or is not supported yet.`);
  };
  return ChainIds[chain];
};
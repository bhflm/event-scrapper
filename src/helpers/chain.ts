import { ChainRpcProviders, ChainIds } from "../types/chains";

export const getRpcProvider = (chainId: number) => {
  if (!ChainRpcProviders[chainId]) {
    throw new Error(`Unable to configure provider for chain ${chainId}`)
  }

  const rpcUrl = ChainRpcProviders[chainId]
  return rpcUrl;
};

export const getChainIdByName = (chainName: string) => {
  if(!ChainIds[chainName]){
    throw new Error(`Chain ${chainName} does not exist or is not supported yet.`);
  };
  return ChainIds[chainName];
};
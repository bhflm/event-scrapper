import { ChainRpcProviders, ChainIds } from "../types/chains";

export const getRpcProviders = (chainId: number) => {
  if (!ChainRpcProviders[chainId]) {
    throw new Error(`Unable to get provider for chain ${chainId}.`)
  }
  return ChainRpcProviders[chainId];
};

export const getChainIdByName = (chain: string) => {
  const chainId = ChainIds[chain];

  if(typeof chainId !== 'number'){
    throw new Error(`Chain ${chain} does not exist or is not supported yet.`);
  };

  return chainId;
};

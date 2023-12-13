export enum ChainIds {
  ETH,
  POL,
  FTM,
  BSC
};

const ETH_RPC = 'https://[REPLACE_ME].com';
const POLYGON_RPC = 'https://polygon-rpc.com'
const FANTOM_RPC = 'https://[REPLACE_ME].com' // @@ todo; find draft provider for this 
const BSC_RPC = 'https://[REPLACE_ME].com' // @@ todo; find alt provider for this 

export const ChainRpcProviders: Record<number, string> = {
  [ChainIds.ETH]: ETH_RPC,
  [ChainIds.POL]: POLYGON_RPC,
  [ChainIds.FTM]: FANTOM_RPC,
  [ChainIds.BSC]: BSC_RPC,
}


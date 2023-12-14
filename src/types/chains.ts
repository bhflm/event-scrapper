// improve: this could be just an enum table
export const ChainIds: Record<string, number> = {
  ETH: 0,
  POL: 1,
  FTM: 2,
  BSC: 3,
}

const POLYGON_RPC = 'https://polygon-rpc.com'
const ETH_RPC = 'https://[REPLACE_ME].com' // @@ TODO: Find provider for chain
const FANTOM_RPC = 'https://[REPLACE_ME].com' // @@TODO: Find provider for chain
const BSC_RPC = 'https://[REPLACE_ME].com' // @@ TODO: Find provider for chain

type ChainProviders = string[]

export const ChainRpcProviders: Record<number, ChainProviders> = {
  [ChainIds.ETH]: [
    ETH_RPC,
    'https://another-rpc-provider.com',
    'https://another-rpc-provider.com',
  ], // @@TODO: find different alt rpc providers for chain,
  [ChainIds.POL]: [POLYGON_RPC, POLYGON_RPC, POLYGON_RPC], // @@TODO: find different alt rpc providers for chain,
  [ChainIds.FTM]: [FANTOM_RPC], // @@TODO: find different alt rpc providers for chain,
  [ChainIds.BSC]: [BSC_RPC], // @@TODO: find different alt rpc providers for chain,
}

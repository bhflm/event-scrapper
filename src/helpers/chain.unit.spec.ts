import { describe, expect, it } from 'vitest'
import { getRpcProvider, getChainIdByName } from './chain';
import { ChainRpcProviders } from '../types/chains';

describe('getChainIdByName', () => {
  const invalidChain = "Foobar";
  it('Should throw with invalid chain', () => {
    try {
      getChainIdByName(invalidChain)
    } catch(err) {
      expect(err).toStrictEqual(Error(`Chain ${invalidChain} does not exist or is not supported yet.`))
    }
  });
  it('Should retrieve valid chain Id', () => {
    const POLChain = "POL";
    const POLChainId = 1;
    const chainId = getChainIdByName(POLChain);
    console.log('CHAIN : ', chainId);
    expect(chainId).toBe(POLChainId);
  });
})

describe('getRpcProvider', () => {
  const invalidChainId = 99999;
  const validChainId = 0;
  it('Should throw with invalid chain', () => {
    try {
      getRpcProvider(invalidChainId)
    } catch(err) {
      expect(err).toStrictEqual(Error(`Unable to configure provider for chain ${invalidChainId}.`))
    }
  });
  it('Should retrieve valid chain Id', () => {
    const rpcProvider = getRpcProvider(validChainId);
    console.log('valid chain: ', rpcProvider)
    expect(rpcProvider).toBe(ChainRpcProviders[0])
  });
})



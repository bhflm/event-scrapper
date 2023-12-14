import { describe, expect, it } from 'vitest'
import { getRpcProviders, getChainIdByName } from './chain'
import { ChainRpcProviders } from '../types/chains'

describe('getChainIdByName', () => {
  const invalidChain = 'Foobar'
  it('Should throw with invalid chain', () => {
    try {
      getChainIdByName(invalidChain)
    } catch (err) {
      expect(err).toStrictEqual(
        Error(`Chain ${invalidChain} does not exist or is not supported yet.`)
      )
    }
  })
  it('Should retrieve valid chain Id', () => {
    const POLChain = 'POL'
    const POLChainId = 1
    const chainId = getChainIdByName(POLChain)
    expect(chainId).toBe(POLChainId)
  })
})

describe('getRpcProvider', () => {
  const invalidChainId = 99999
  const validChainId = 0
  it('Should throw with invalid chain', () => {
    try {
      getRpcProviders(invalidChainId)
    } catch (err) {
      expect(err).toStrictEqual(
        Error(`Unable to get provider for chain ${invalidChainId}.`)
      )
    }
  })
  it('Should retrieve valid chain Id', () => {
    const rpcProvider = getRpcProviders(validChainId)
    expect(rpcProvider).toBe(ChainRpcProviders[0])
  })
})

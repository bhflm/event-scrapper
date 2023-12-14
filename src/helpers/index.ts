import { ethers } from 'ethers'
import { BlockTag } from '@ethersproject/abstract-provider'
import { getRpcProviders } from './chain'
import { FeeCollectorContract } from 'src/contracts/feeCollector'

export const BLOCKS_RANGE_THRESHOLD = 1024 //https://docs.blockpi.io/guides-for-web-3.0-users/how-to-use-blockpi/best-practices
const CHUNK_SIZE = 150
interface ParsedFeeCollectedEvents {
  token: string // the address of the token that was collected
  integrator: string // the integrator that triggered the fee collection
  integratorFee: ethers.BigNumberish // the share collector for the integrator
  lifiFee: ethers.BigNumberish // the share collected for lifi
}

//**
/* Retrieves the last block for chain given ID
 * @param chainId number
 * @returns BlockTag
 */
export const getLastChainBlock = async (chainId: number) => {
  try {
    const [rpcUrl] = getRpcProviders(chainId)
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const lastBlock = await provider.getBlockNumber()

    return lastBlock
  } catch (error) {
    console.error('Error fetching last block from contract:', error.message)
  }
}

/**
 * For a given block range all `FeesCollected` events are loaded from the Polygon FeeCollector
 * Throws if exceeds maximum block range
 * https://github.com/bnb-chain/bsc/issues/113
 * https://ethereum.stackexchange.com/questions/107590/contract-queryfilterfilter-giving-me-errors-in-ethers-js
 *
 * @param fromBlock
 * @param toBlock
 */

const SAFE_BLOCK_RANGE = 1024 // https://docs.blockpi.io/guides-for-web-3.0-users/how-to-use-blockpi/best-practices
const RETRY_THRESHOLD = 3

/**
 * Scrapes events from given contract between a block range. If fails because of timeout, switches the contract provider to keep calling until it
 * reaches the retry threshold.
 * @param feeCollector feeCollector contract
 * @param fromBlock from block to scan from
 * @param toBlock block number to scan to,
 * @returns array of ethers.event[]
 */
export const loadFeeCollectorEvents = async (
  feeCollector: FeeCollectorContract,
  fromBlock: BlockTag,
  toBlock: BlockTag
): Promise<ethers.Event[]> => {
  let feeCollectorContract = feeCollector.getFeeCollectorInstance()
  const blockRange =
    parseInt(toBlock.toString(), 10) - parseInt(fromBlock.toString(), 10)

  if (blockRange >= SAFE_BLOCK_RANGE) {
    throw Error(`Cannot exceed maximum block range: ${SAFE_BLOCK_RANGE}`)
  }

  try {
    const filter = feeCollectorContract.filters.FeesCollected()
    const events = await feeCollectorContract.queryFilter(
      filter,
      fromBlock,
      toBlock
    )
    return events
  } catch (err) {
    if (err.code == 'SERVER_ERROR') {
      throw Error(err.code)
    }

    let retries = 0

    while (err.code === 'TIMEOUT' && retries < RETRY_THRESHOLD) {
      console.log('retry attempt: ', retries)
      feeCollector.changeRpcProvider()
      feeCollectorContract = feeCollector.getFeeCollectorInstance()
      retries += 1

      try {
        const filter = feeCollectorContract.filters.FeesCollected()
        const events = await feeCollectorContract.queryFilter(
          filter,
          fromBlock,
          toBlock
        )
        return events
      } catch (error) {
        console.log(error.code)
        err = error // Update the error for the next iteration
      }
    }

    throw err
  }
}

/**
 * Returns a scan over a given blockrange. If the blockrange is below the _safe_ threshold, does a single call, otherwise, it
 * executes a chunk strategy to make multiple calls without overloading the rpc
 *
 * @param feeCollector FeeCollectorContract
 * @param fromBlock initial block to scan from
 * @param toBlock end block to scan to
 * @returns array of raw ethers.events[]
 */
export const loadFeeCollectorEventsInChunks = async (
  feeCollector: FeeCollectorContract,
  fromBlock: number,
  toBlock: number
): Promise<ethers.Event[]> => {
  try {
    console.log('loadFeeCollector', fromBlock, toBlock);
    const chunks: number[][] = []
    const blockRangeScan = toBlock - fromBlock

    if (blockRangeScan < BLOCKS_RANGE_THRESHOLD) {
      const singleChunk = await loadFeeCollectorEvents(
        feeCollector,
        fromBlock + 1,
        toBlock
      )
      return singleChunk
    }

    for (let start = fromBlock + 1; start <= toBlock; start += CHUNK_SIZE) {
      const end = Math.min(start + CHUNK_SIZE - 1, toBlock)
      chunks.push([start, end])
    }

    const eventsPromises = chunks.map(([from, to]) =>
      loadFeeCollectorEvents(feeCollector, from, to)
    )
    const rawChunksResults: ethers.Event[][] = await Promise.all(eventsPromises)
    const flattenedChunkResults: ethers.Event[] = rawChunksResults.flat()
    return flattenedChunkResults
  } catch (error) {
    console.error(`Error fetching blocks: ${error.message}`)
    throw error
  }
}

/**
 * Takes a list of raw events and parses them into ParsedFeeCollectedEvents
 * @param events
 */
export const parseFeeCollectorEvents = (
  feeCollectorContract: ethers.Contract,
  events: ethers.Event[]
): ParsedFeeCollectedEvents[] => {
  return events.map((event) => {
    const { topics, data } = event

    const parsedEvent = feeCollectorContract.interface.parseLog({
      topics,
      data,
    })

    const feesCollected: ParsedFeeCollectedEvents = {
      token: parsedEvent.args[0],
      integrator: parsedEvent.args[1],
      integratorFee: ethers.BigNumber.from(parsedEvent.args[2]),
      lifiFee: ethers.BigNumber.from(parsedEvent.args[3]),
    }
    return feesCollected
  })
}

export const parseToEventsModel = (
  events: ParsedFeeCollectedEvents[],
  chainId: number
) => {
  return events.map((event) => {
    const { token, integrator, integratorFee, lifiFee } = event
    return {
      token,
      integrator,
      chainId,
      integratorFee: integratorFee.toString(),
      lifiFee: lifiFee.toString(),
    }
  })
}

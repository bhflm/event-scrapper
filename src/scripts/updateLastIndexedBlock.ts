import { connectToDatabase } from '../dbConnection'
import { getChainIdByName } from '../helpers/chain'
import { saveLastIndexedBlock } from '../services/feeCollector.service'
import { DEFAULT_OLDEST_BLOCK } from './constants'
// DEBUG script
// !! WARN: Will upsert the db with last indexed block as the default value.
// This should be run on startup if last indexed block is 0.

// Usage: npm run blocks:update-last-indexed {chainName} {blockNumber}?

const run = async () => {
  try {
    await connectToDatabase()

    const argvChain = process.argv[2]
    let blockNumber = parseInt(process.argv[3], 10)

    if (!blockNumber) {
      blockNumber = DEFAULT_OLDEST_BLOCK
    }

    const chainId = getChainIdByName(argvChain)

    await saveLastIndexedBlock(DEFAULT_OLDEST_BLOCK, chainId)

    console.log(
      `Updated last indexed block: ${blockNumber} for chain ${argvChain} (${chainId})`
    )
    process.exit(1)
  } catch (err) {
    console.error('Error updating last indexed block: ', err.message)
    process.exit(0)
  }
}

run()

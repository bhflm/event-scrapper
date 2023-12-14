import { getLastChainBlock } from '../helpers'
import { connectToDatabase } from '../dbConnection'
import { getChainIdByName } from '../helpers/chain'
import { FeeCollectorContract } from '../contracts/feeCollector'
import {
  getLastIndexedBlock,
  saveLastIndexedBlock,
} from '../services/feeCollector.service'
import { loadFeeCollectorEventsInChunks } from '../helpers/index'

// Usage: npm run blocks:listen ${chainId}
/**
 *
 * Scrapes new blocks until it reaches the last block
 */
const run = async () => {
  try {
    await connectToDatabase()
    const another = true // Set to true to start the loop

    const argvChain = process.argv[2]
    const chainId = getChainIdByName(argvChain)

    const feeCollector = new FeeCollectorContract(chainId)

    let { lastIndexedBlock } = await getLastIndexedBlock(chainId)

    lastIndexedBlock = 51000000

    while (another) {
      console.log('Scrapping new blocks...')
      // Fetch last block indexed;
      const lastChainBlock = await getLastChainBlock(chainId)

      await loadFeeCollectorEventsInChunks(
        feeCollector,
        lastIndexedBlock,
        lastChainBlock
      )

      // Check if a new block has been mined
      if (lastChainBlock !== lastIndexedBlock) {
        lastIndexedBlock = lastChainBlock
        await saveLastIndexedBlock(lastChainBlock, chainId)
      }

      // Pause for a while before the next iteration
      await new Promise((resolve) => setTimeout(resolve, 5000)) // 5000 milliseconds (adjust as needed)

      process.exit(1)
    }
  } catch (err) {
    console.error('Error updating last indexed block: ', err.message)
    process.exit(0)
  }
}

run()

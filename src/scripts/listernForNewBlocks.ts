import { getLastChainBlock } from '../helpers'
import { connectToDatabase } from '../dbConnection'
import { getChainIdByName } from '../helpers/chain'
import { saveLastIndexedBlock } from '../services/feeCollector.service'

// Usage: npm run blocks:listen ${chainId}
/**
 *
 * Scrapes new blocks until it reaches the last block
 */
const run = async () => {
  try {
    await connectToDatabase()
    let another = false

    const argvChain = process.argv[2]
    const chainId = getChainIdByName(argvChain)
    // fetch last block indexed;
    const lastBlockIndexed = null
    // fetch last chain block;
    let lastChainBlock = await getLastChainBlock(chainId)

    while (lastChainBlock && another) {
      const blockRange = lastChainBlock - lastBlockIndexed
      if (blockRange > 1024) {
        // @@ TODO: Replace with constant
        // feeCollector chunk range
      } else {
        // feeCollector single call
      }

      const isNewChainBlock = await getLastChainBlock(chainId)
      if (isNewChainBlock != lastChainBlock) {
        lastChainBlock = isNewChainBlock
        another = true
        await saveLastIndexedBlock(lastChainBlock, chainId)
      }
    }
    process.exit(1)
  } catch (err) {
    console.error('Error updating last indexed block: ', err.message)
    process.exit(0)
  }
}

run()

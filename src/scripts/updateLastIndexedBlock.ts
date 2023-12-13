import { connectToDatabase } from "../dbConnection";
import { ChainIds } from "../types/chains";
import { getLastIndexedBlock, saveLastIndexedBlock } from "../services/feeCollector.service";

const DEFAULT_OLDEST_BLOCK = 47961368;

// @@ DEBUG script
// !! WARN: Will upsert the db with last indexed block as the default value. 
// This should be run on startup if last indexed block is 0.

// Usage: npm run update-last-block {chainId}
const run = async () => {
  try {
    await connectToDatabase();

    console.log('Process.args', process.argv)
    // let block = await getLastIndexedBlock();
    let block = null;

    const argChainId = process.argv[2];

    console.log('ARGV: ', argChainId);


    const chainId = ChainIds[argChainId as keyof typeof ChainIds]


    console.log('CHAIN ID: ', chainId);

    if (!chainId) {
      throw Error('Invalid chain id');
    }

    // if (block.lastIndexedBlock == 0) {
      block = await saveLastIndexedBlock(DEFAULT_OLDEST_BLOCK, chainId);
    // }
    console.log('Indexed last block as: ', block);
    process.exit(1);
  } catch(err) {
    console.error('ERROR WHILE UPDATING LAST INDEXED BLOCK: ', err.message);
    process.exit(0);
  }
  
};


run();
import { connectToDatabase } from "../dbConnection";
import { getLastIndexedBlock, saveLastIndexedBlock } from "../services/feeCollector.service";

const DEFAULT_OLDEST_BLOCK = 47961368;

// @@ DEBUG script
// !! WARN: Will upsert the db with last indexed block as the default value. 
// This should be run on startup if last indexed block is 0.
const run = async () => {
  try {
    await connectToDatabase();

    // let block = await getLastIndexedBlock();

    let block = null;

    console.log('LAST BLOCK INDEXED: ', block);
    // if (block.lastIndexedBlock == 0) {
      block = await saveLastIndexedBlock(DEFAULT_OLDEST_BLOCK);
    // }
    console.log('Indexed last block as: ', block);
    process.exit(1);
  } catch(err) {
    console.error('ERROR WHILE UPDATING LAST INDEXED BLOCK: ', err.message);
    process.exit(0);
  }
  
};


run();
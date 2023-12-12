import cors from 'cors';
import express from 'express';
import router from './routes';
import { connectToDatabase } from './dbConnection';

const app = express();

app
  .use(cors())
  .use(express.json())
  .use(router)

const APP_PORT = 3000;

const start = async (): Promise<void> => {
  try {
    await connectToDatabase();
    app.listen(APP_PORT, () => {
      console.log(`Server started on port ${APP_PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

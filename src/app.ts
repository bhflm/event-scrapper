import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import mongoose from "mongoose";
import router from './routes';

const app = express();

app
  .use(cors())
  .use(express.json())
  .use(router)

const APP_PORT = 8080;

const start = async (): Promise<void> => {
  try {
    
    app.listen(APP_PORT, () => {
      console.log("Server started on port 3000");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

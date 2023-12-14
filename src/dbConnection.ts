import mongoose from 'mongoose'
import dotenv from 'dotenv'

mongoose.Promise = global.Promise
dotenv.config()

const { DB_HOST, DB_NAME, DB_PORT } = process.env
// const {  DB_PASS, DB_USER } = process.env;

const connectToDatabase = async (): Promise<void> => {
  await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
    authSource: 'admin',
  })
  console.log('Connected to db')
}

export { connectToDatabase }

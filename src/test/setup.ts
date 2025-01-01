import dotenv from 'dotenv'
import mongoose from 'mongoose'
import dbSeed from '../helpers/db-seed'
dotenv.config()

let db: typeof mongoose

export default async () => {
  if (process.env.APP_ENV !== 'testing') {
    console.error('FATAL ERROR: Current environment MUST BE testing')
    process.exit(1)
  }

  db = await mongoose.connect('mongodb://localhost:27017/esperoo-test')
  await db.connection.db.dropDatabase()
  await dbSeed()
  console.log('Setup OK!')
}

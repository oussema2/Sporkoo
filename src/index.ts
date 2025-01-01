import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.join(__dirname, '../.env') })
import server from './app'
import mongoose from 'mongoose'
import { addInitialAllergens } from './services/allergen.service'

async function start(): Promise<void> {
  await mongoose.connect(
    `mongodb://localhost:27017/${process.env.DATABASE_NAME}`,
  )
  await addInitialAllergens()
  const app = await server()

  const port = process.env.APP_PORT || '4444'

  app.listen({ port: parseInt(port) }, (err, adress) => {
    if (err !== null) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${adress}`)
  })
}
start()

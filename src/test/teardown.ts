import mongoose from 'mongoose'

export default async () => {
  await mongoose.connection.close()
  console.log('TearDown OK!')
}

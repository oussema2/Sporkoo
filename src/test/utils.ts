import mongoose from 'mongoose'

export const testDbConnect = async () => {
  return await mongoose.connect(
    process.env.TEST_DB_URL || 'mongodb://localhost:27017/esperoo-test',
  )
}

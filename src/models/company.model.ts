import mongoose from 'mongoose'
import { Company } from '../@types/company.types'
import branchModel from './branch.model'

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    adress: { type: String, required: true },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    account: { type: mongoose.Types.ObjectId, ref: 'Account', required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

CompanySchema.post('findOneAndDelete', async function (doc) {
  await branchModel.deleteMany({ company: doc._id }).exec()
})

export default mongoose.model<Company>('Company', CompanySchema)

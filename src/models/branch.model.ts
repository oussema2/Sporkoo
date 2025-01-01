import mongoose from 'mongoose'
import { Branch } from '../@types/branch.types'

export const WifiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
})
export const SocialsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
})

const BranchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    adress: { type: String, required: true },
    phone: { type: String, required: true },
    managers: [{ type: mongoose.Types.ObjectId, ref: 'User', default: [] }],
    company: { type: mongoose.Types.ObjectId, ref: 'Company', required: true },
    wifis: [{ type: WifiSchema, default: [] }],
    socials: [{ type: SocialsSchema, default: [] }],
    country: { type: String, required: true },
    nbTable: { type: String, required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model<Branch>('Branch', BranchSchema)

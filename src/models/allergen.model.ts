import mongoose from 'mongoose'
import { Allergen } from '../@types/allergen.types'

const AllergenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    company: { type: mongoose.Types.ObjectId, required: false, ref: 'Company' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)
AllergenSchema.index({ name: 1, company: 1 }, { unique: true })
AllergenSchema.index({ name: 'text' })

export default mongoose.model<Allergen>('Allergen', AllergenSchema)

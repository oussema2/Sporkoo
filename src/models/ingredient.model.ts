import mongoose from 'mongoose'
import { Ingredient } from '../@types/ingredient.types'

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: mongoose.Types.ObjectId, required: true, ref: 'Company' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

IngredientSchema.index({ name: 1, company: 1 }, { unique: true })
IngredientSchema.index({ name: 'text' })

export default mongoose.model<Ingredient>('Ingredient', IngredientSchema)

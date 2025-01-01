import mongoose from 'mongoose'
import { UnavailableIngredient } from '../@types/unavailable-ingredient.types'

export const UnavailableIngredientSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    branch: { type: mongoose.Types.ObjectId, ref: 'Branch', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, reqired: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model<UnavailableIngredient>(
  'UnavailableIngredient',
  UnavailableIngredientSchema,
)

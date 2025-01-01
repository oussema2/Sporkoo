import mongoose from 'mongoose'
import { Item } from '../@types/item.types'

const ItemVariation = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
})

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    company: { type: mongoose.Types.ObjectId, ref: 'Company', required: true },
    ingredients: [
      { type: mongoose.Types.ObjectId, ref: 'Ingredient', required: true },
    ],
    allergens: [
      { type: mongoose.Types.ObjectId, ref: 'Allergen', default: [] },
    ],
    variations: [{ type: ItemVariation, required: true }],
    image: { type: String, default: '' },
    keywords: [{ type: mongoose.Types.ObjectId, ref: 'Keyword', default: [] }],
    branch: { type: mongoose.Types.ObjectId, ref: 'Branch', required: true },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)
ItemSchema.index({ name: 'text' })
export default mongoose.model<Item>('Item', ItemSchema)

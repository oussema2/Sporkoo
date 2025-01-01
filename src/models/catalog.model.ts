import mongoose from 'mongoose'
import { Catalog } from '../@types/catalog.types'

const SectionItem = new mongoose.Schema({
  order: { type: Number, required: true },
  item: { type: mongoose.Types.ObjectId, ref: 'Item', required: true },
  actif: { type: Boolean, default: true },
})
const SectionSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  name: { type: String, required: true },
  items: [{ type: SectionItem, default: [] }],
  description: { type: String, default: '' },
})

const CatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    branch: { type: mongoose.Types.ObjectId, required: true, ref: 'Branch' },
    days: [{ type: String, default: [] }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    sections: [{ type: SectionSchema, default: [] }],
    available: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model<Catalog>('Catalog', CatalogSchema)

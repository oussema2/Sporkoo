import mongoose from 'mongoose'
import { Keyword } from '../@types/keyword.types'

const KeywordSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    icon: { type: String, required: true },
    company: { type: mongoose.Types.ObjectId, required: true, ref: 'Company' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

KeywordSchema.index({ label: 1, company: 1 }, { unique: true })
KeywordSchema.index({ label: 'text' })

export default mongoose.model<Keyword>('Keyword', KeywordSchema)

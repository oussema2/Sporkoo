import mongoose from 'mongoose'
import { Account, AccountTypes } from '../@types/account.types'

const AccountSchema = new mongoose.Schema(
  {
    type: { type: String, enum: AccountTypes, default: AccountTypes.BASIC },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model<Account>('Account', AccountSchema)

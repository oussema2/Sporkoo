import mongoose from 'mongoose'
import { User } from '../@types/user.types'
import { ObjectId } from 'mongodb'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'owner' },
    createdBy: { type: ObjectId, ref: 'User', default: null },
    active: { type: Boolean, default: false },
    verificationCode: { type: String, default: '' },
    refreshToken: { type: String },
    timestamp: { type: Date, default: Date.now },
    account: { type: mongoose.Types.ObjectId, ref: 'Account', required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)

export default mongoose.model<User>('User', UserSchema)

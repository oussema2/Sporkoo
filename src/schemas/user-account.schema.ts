import { ObjectId } from 'mongodb'
import { z } from 'zod'

export const AccountSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  type: z.string({ required_error: 'Account type is missing' }),
})
export const CreateUserAccount = AccountSchema.pick({
  type: true,
})

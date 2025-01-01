import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { UserSchema } from './user.schema'
import { AccountSchema } from './user-account.schema'

export const CompanySchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Name is missing' }),
  adress: z.string({ required_error: 'adress is required' }),
  createdBy: z
    .string()
    .transform(value => new ObjectId(value))
    .or(UserSchema),
  account: z
    .string()
    .transform(value => new ObjectId(value))
    .or(AccountSchema),
})

export const CreateCompanySchema = CompanySchema.pick({
  adress: true,
  name: true,
})

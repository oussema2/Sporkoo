import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { CompanySchema } from './company.schema'
import { UserSchema } from './user.schema'

export const BranchSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Branch name is required' }),
  adress: z.string({ required_error: 'Branch adress is required' }),
  phone: z.string({ required_error: 'Phone is required ' }),
  country: z.string({ required_error: 'Branch country is missing' }),
  nbTable: z.string({ required_error: 'Branch numbre of table is missing' }),
  company: z
    .string()
    .transform(value => new ObjectId(value))
    .or(CompanySchema),
  managers: z.array(
    z
      .string()
      .transform(value => new ObjectId(value))
      .or(UserSchema),
  ),
})

export const WifiSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Wifi name is required' }),
  password: z.string({ required_error: 'Wifi password is required' }),
  isActive: z.boolean().default(true),
})

export const CreateBranchSchema = BranchSchema.pick({
  adress: true,
  name: true,
  company: true,
  phone: true,
})

export const RegisterBranch = BranchSchema.pick({
  adress: true,
  name: true,
  phone: true,
  country: true,
  nbTable: true,
})

export const CreateWifiSchema = WifiSchema.pick({
  name: true,
  password: true,
})

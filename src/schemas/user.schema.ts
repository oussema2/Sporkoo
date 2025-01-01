import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { AccountSchema } from './user-account.schema'

export const UserSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string().min(1, 'Name Is Missing').max(2555),
  email: z.string().email({ message: 'Invalid Email adress' }).trim(),
  password: z
    .string()
    .min(8, 'Password must be at lease 8 characters long')
    .max(255)
    .trim(),
  createdBy: z.string().transform(value => new ObjectId(value)),
  role: z.string().min(1, 'Role Is Missing'),
  active: z.boolean().default(false),
  refreshToken: z.string(),
  verificationCode: z.union([z.string().length(4), z.null()]).optional(),
  account: z
    .string()
    .transform(value => new ObjectId(value))
    .or(AccountSchema),
})

export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
})

export const UpdateManagerSchema = UserSchema.pick({
  name: true,
})

export const UserLoginSchema = UserSchema.pick({
  email: true,
  password: true,
})

export const CreateJWTUserSchema = UserSchema.pick({
  _id: true,
  role: true,
  name: true,
})

export const CreateManagerSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  createdBy: true,
})

export const createdUserSchema = UserSchema.pick({
  name: true,
  email: true,
  _id: true,
})

export const changeUserPasswordSchema = UserSchema.pick({
  password: true,
})

export const AuthenticatedUserSchema = UserSchema.pick({
  _id: true,
  active: true,
  createdBy: true,
  email: true,
  name: true,
  role: true,
})

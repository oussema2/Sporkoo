import { z } from 'zod'

import {
  AuthenticatedUserSchema,
  CreateManagerSchema,
  CreateUserSchema,
  UpdateManagerSchema,
  UserLoginSchema,
  UserSchema,
  changeUserPasswordSchema,
} from '../schemas/user.schema'
import { ObjectId } from 'mongodb'

export type User = z.infer<typeof UserSchema>

export type CreateUserRequest = z.infer<typeof CreateUserSchema>
export type RegisterUserRequest = z.infer<typeof CreateUserSchema>
export type UserLoginRequest = z.infer<typeof UserLoginSchema>
export type CreateManager = z.infer<typeof CreateManagerSchema>
export type UpdateManager = z.infer<typeof UpdateManagerSchema>
export type CreatedUser = { email: string; name: string; _id: string }
export type ChangeUserPasswordRequest = z.infer<typeof changeUserPasswordSchema>
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema> & {
  token: string
  accountType: string
  hasCompany: boolean
}

export type UserToken = {
  token: string
}
export type UserJwtPayload = {
  _id: ObjectId
  email: string
  name: string
  role: string
  accountType: string
}

export enum Roles {
  OWNER,
  ADMIN,
  MANAGER,
}
export type ResendCodeResponse = {
  message: string
}

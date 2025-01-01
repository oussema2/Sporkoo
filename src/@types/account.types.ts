import { z } from 'zod'
import {
  AccountSchema,
  CreateUserAccount,
} from '../schemas/user-account.schema'

export type Account = z.infer<typeof AccountSchema>
export enum AccountTypes {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}
export type CreateUserAccountRequest = z.infer<typeof CreateUserAccount>

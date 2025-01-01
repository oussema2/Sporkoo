import { z } from 'zod'
import {
  BranchSchema,
  CreateBranchSchema,
  CreateWifiSchema,
  RegisterBranch,
} from '../schemas/branch.schema'

export type CreateBranchRequest = z.infer<typeof CreateBranchSchema>
export type UpdateBranchRequest = z.infer<typeof CreateBranchSchema>
export type CreateWifiRequest = z.infer<typeof CreateWifiSchema>
export type Branch = z.infer<typeof BranchSchema>
export type RegisterBranch = z.infer<typeof RegisterBranch>
export type AddManagerParamsType = {
  branchId: string
  managerId: string
}

export type Wifi = {
  name: string
  password: string
  isActive: boolean
}

export type Social = {
  type: string
  link: string
}

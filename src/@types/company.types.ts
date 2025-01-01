import { z } from 'zod'
import { CompanySchema, CreateCompanySchema } from '../schemas/company.schema'
import { Branch } from './branch.types'
export type CreateCompanyRequest = z.infer<typeof CreateCompanySchema>
export type UpdateCompanyRequest = z.infer<typeof CreateCompanySchema>
export type Company = z.infer<typeof CompanySchema>
export type CompaniesWithBranches = z.infer<typeof CompanySchema> & {
  branches: Branch[]
}

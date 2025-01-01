import { z } from 'zod'
import { CompanySchema } from './company.schema'
import { ObjectId } from 'mongodb'

export const KeywordSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  label: z.string({ required_error: 'Keyword label is missing' }),
  icon: z.string({ required_error: 'Keyword icon is missing' }),
  company: z
    .string({ required_error: 'Company is missing' })
    .transform(value => new ObjectId(value))
    .or(CompanySchema),
})
export const CreateKeywordSchema = KeywordSchema.pick({
  label: true,
  icon: true,
  company: true,
})
export const UpdateKeywordSchema = KeywordSchema.pick({
  icon: true,
  label: true,
})

import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { CompanySchema } from './company.schema'

export const IngredientSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Ingredient name is missing' }),
  company: z
    .string({ required_error: 'Company is missing' })
    .transform(value => new ObjectId(value))
    .or(CompanySchema),
})

export const CreateIngredientSchema = IngredientSchema.pick({
  name: true,
  company: true,
})

export const UpdateIngredientSchema = IngredientSchema.pick({
  name: true,
})

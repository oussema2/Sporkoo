import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { BranchSchema } from './branch.schema'
import { IngredientSchema } from './ingredient.schema'

export const UnavailableIngredientSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  branch: z
    .string({ required_error: 'Branch is missing' })
    .transform(value => new ObjectId(value))
    .or(BranchSchema),
  ingredient: z
    .string({ required_error: 'Ingredient is missing' })
    .transform(value => new ObjectId(value))
    .or(IngredientSchema),
  startDate: z
    .string({ required_error: 'Start Date is missing' })
    .transform(value => new Date(value)),
  endDate: z
    .string({ required_error: 'End Date is missing' })
    .transform(value => new Date(value)),
})

export const CreateUnavailableIngredientSchema =
  UnavailableIngredientSchema.pick({
    branch: true,
    ingredient: true,
    startDate: true,
    endDate: true,
  })

export const UpdateUnavailableIngredientSchema =
  UnavailableIngredientSchema.pick({
    startDate: true,
    endDate: true,
  })

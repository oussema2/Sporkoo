import { z } from 'zod'
import {
  CreateIngredientSchema,
  IngredientSchema,
  UpdateIngredientSchema,
} from '../schemas/ingredient.schema'
import { Pagination } from './common.types'

export type Ingredient = z.infer<typeof IngredientSchema>
export type CreateIngredientRequest = z.infer<typeof CreateIngredientSchema>
export type PaginatedIngredients = Pagination & {
  ingredients: Ingredient[]
}
export type UpdateIngredientRequest = z.infer<typeof UpdateIngredientSchema>

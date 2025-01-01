import { z } from 'zod'
import {
  CreateUnavailableIngredientSchema,
  UnavailableIngredientSchema,
  UpdateUnavailableIngredientSchema,
} from '../schemas/unavailable-ingredient.schema'
import { Pagination } from './common.types'

export type UnavailableIngredient = z.infer<typeof UnavailableIngredientSchema>

export type AddUnavailableIngredientParamType = {
  ingredient: string
  branch: string
}

export type CreateUnavailableIngredientRequest = z.infer<
  typeof CreateUnavailableIngredientSchema
>

export type UpdateUnavailableIngredientRequest = z.infer<
  typeof UpdateUnavailableIngredientSchema
>

export type PaginatedUnailableIngredients = Pagination & {
  unavailableIngredients: UnavailableIngredient[]
}

import { PaginationParams } from '../@types/common.types'
import {
  Allergen,
  CreateAllergenRequest,
  InitialAllergens,
  PaginatedAllergens,
} from '../@types/allergen.types'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import allergenModel from '../models/allergen.model'

export const createAllergen = async (
  payload: CreateAllergenRequest,
): Promise<Allergen> => {
  return await allergenModel.create(payload)
}

export const getAllergens = async (): Promise<Allergen[]> => {
  return await allergenModel.find()
}
export const getPaginatedAllergens = async (
  pagination: PaginationParams,
): Promise<PaginatedAllergens> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit and page are invalid')
  }
  const skip = (page - 1) * limit
  const allergens = await allergenModel.find().skip(skip).limit(limit).sort({
    created_at: -1,
  })
  const totalItems = await allergenModel.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    allergens,
  }
}

export const searchallergens = async (
  pattern: string,
  pagination: PaginationParams,
): Promise<PaginatedAllergens> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const allergens = await allergenModel
    .find({ name: { $regex: pattern, $options: 'i' } })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await allergenModel
    .find({ name: { $regex: pattern, $options: 'i' } })
    .countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    allergens,
  }
}

export const addInitialAllergens = async () => {
  try {
    for (const allergen in InitialAllergens) {
      if (isNaN(Number(allergen))) {
        const exists = await allergenModel.findOne({ name: allergen })
        if (!exists) {
          await allergenModel.create({ name: allergen })
          console.log(`Added allergen: ${allergen}`)
        } else {
          console.log(`Allergen ${allergen} already exists`)
        }
      }
    }
  } catch (error) {
    console.error('Error adding initial data:', error)
  }
}

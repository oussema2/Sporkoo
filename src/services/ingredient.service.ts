import { DeleteResult } from 'mongodb'
import {
  CreateIngredientRequest,
  Ingredient,
  PaginatedIngredients,
  UpdateIngredientRequest,
} from '../@types/ingredient.types'
import { HttpNotFound } from '../errors/http-not-found.error'
import ingredientModel from '../models/ingredient.model'
import { checkCompanyOwner } from '../routes/companies.routes'
import {
  CreateUnavailableIngredientRequest,
  PaginatedUnailableIngredients,
  UnavailableIngredient,
  UpdateUnavailableIngredientRequest,
} from '../@types/unavailable-ingredient.types'
import { checkUserIsRelatedToBranch } from './branch.service'
import unavailableingredientModel from '../models/unavailable-ingredient.model'
import { PaginationParams } from '../@types/common.types'
import { HttpBadRequest } from '../errors/http-bad-request.error'

export const createIngredient = async (
  payload: CreateIngredientRequest,
  userId: string,
): Promise<Ingredient> => {
  await checkCompanyOwner(userId, payload.company.toString())
  return await ingredientModel.create(payload)
}

export const updateIngredient = async (
  id: string,
  payload: UpdateIngredientRequest,
  userId: string,
): Promise<Ingredient> => {
  const ingredient = await ingredientModel.findById(id)
  if (!ingredient) {
    throw new HttpNotFound('Ingredient not found')
  }

  await checkCompanyOwner(userId, ingredient.company.toString())
  ingredient.name = payload.name
  await ingredient.save()
  return ingredient
}

export const deleteIngredient = async (id: string): Promise<DeleteResult> => {
  return await ingredientModel.deleteOne({ _id: id })
}

export const getIngredientById = async (
  id: string,
  userId: string,
): Promise<Ingredient> => {
  const ingredient = await ingredientModel.findById(id)
  if (!ingredient) {
    throw new HttpNotFound('Ingredient not found')
  }
  await checkCompanyOwner(userId, ingredient.company.toString())
  return ingredient
}

export const getIngredientsByCompany = async (
  id: string,
  pagination: PaginationParams,
  userId: string,
): Promise<PaginatedIngredients> => {
  await checkCompanyOwner(userId, id)
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit and page are invalid')
  }
  const skip = (page - 1) * limit
  const ingredients = await ingredientModel
    .find({ company: id })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await ingredientModel.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)
  return {
    page,
    limit,
    totalPages,
    totalItems,
    ingredients,
  }
}

export const AddUnavailableIngredient = async (
  payload: CreateUnavailableIngredientRequest,
  userId: string,
): Promise<UnavailableIngredient> => {
  await checkUserIsRelatedToBranch(userId, payload.branch.toString())
  return await unavailableingredientModel.create(payload)
}
export const updateUnavailable = async (
  id: string,
  payload: UpdateUnavailableIngredientRequest,
  userId: string,
): Promise<UnavailableIngredient> => {
  const unavailableIngredient = await unavailableingredientModel.findById(id)
  if (!unavailableIngredient) {
    throw new HttpNotFound('Unavailable ingredient not found')
  }
  await checkUserIsRelatedToBranch(
    userId,
    unavailableIngredient.branch.toString(),
  )
  const updateResponse = await unavailableingredientModel.findByIdAndUpdate(
    id,
    payload,
    { new: true },
  )
  if (!updateResponse) {
    throw new HttpNotFound('Unavailable ingredient not found')
  }
  return updateResponse
}

export const deleteUnavailable = async (
  id: string,
  userId: string,
): Promise<DeleteResult> => {
  const unavailable = await unavailableingredientModel.findById(id)
  if (!unavailable) {
    throw new HttpNotFound('Unavailable ingredient not found')
  }
  await checkUserIsRelatedToBranch(userId, unavailable.branch.toString())
  return await unavailableingredientModel.deleteOne({ _id: id })
}

export const getUnavailableIngredientById = async (
  id: string,
  userId: string,
): Promise<UnavailableIngredient> => {
  const unavailableIngredient = await unavailableingredientModel.findById(id)
  if (!unavailableIngredient) {
    throw new HttpNotFound('Unavailable ingredient not found')
  }
  await checkUserIsRelatedToBranch(
    userId,
    unavailableIngredient.branch.toString(),
  )
  return unavailableIngredient
}

export const getUnavailableIngredientByIdByBranch = async (
  branchId: string,
  pagination: PaginationParams,
  userId: string,
): Promise<PaginatedUnailableIngredients> => {
  await checkUserIsRelatedToBranch(userId, branchId)
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit and page are invalid')
  }
  const skip = (page - 1) * limit
  const unavailableIngredients = await unavailableingredientModel
    .find({ company: branchId })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await ingredientModel.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)
  return {
    page,
    limit,
    totalPages,
    totalItems,
    unavailableIngredients,
  }
}

export const getAllIngredientsByCompany = async (
  companyId: string,
  userId: string,
): Promise<Ingredient[]> => {
  await checkCompanyOwner(userId, companyId)
  return ingredientModel.find({ company: companyId })
}
export const searchIngredients = async (
  pattern: string,
  companyId: string,
  pagination: PaginationParams,
): Promise<PaginatedIngredients> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const ingredients = await ingredientModel
    .find({ name: { $regex: pattern, $options: 'i' }, company: companyId })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await ingredientModel
    .find({ name: { $regex: pattern, $options: 'i' }, company: companyId })
    .countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    ingredients,
  }
}

export const searchUnavailableIngredients = async (
  pattern: string,
  branch: string,
  pagination: PaginationParams,
): Promise<PaginatedUnailableIngredients> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const unavailableIngredients = await unavailableingredientModel
    .find({ name: { $regex: pattern, $options: 'i' }, branch: branch })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await unavailableingredientModel
    .find({ name: { $regex: pattern, $options: 'i' }, branch: branch })
    .countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    unavailableIngredients,
  }
}

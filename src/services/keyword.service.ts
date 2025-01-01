import { PaginationParams } from '../@types/common.types'
import {
  CreateKeywordRequest,
  Keyword,
  PaginatedKeywords,
  UpdateKeywordRequest,
} from '../@types/keyword.types'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import { HttpNotFound } from '../errors/http-not-found.error'
import keywordModel from '../models/keyword.model'
import { checkCompanyOwner } from '../routes/companies.routes'

export const createKeyword = async (
  payload: CreateKeywordRequest,
  userId: string,
): Promise<Keyword> => {
  await checkCompanyOwner(userId, payload.company.toString())
  return await keywordModel.create(payload)
}

export const getKeywordsByCompany = async (
  company: string,
  pagination: PaginationParams,
  userId: string,
): Promise<PaginatedKeywords> => {
  await checkCompanyOwner(userId, company)
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit and page are invalid')
  }
  const skip = (page - 1) * limit
  const keywords = await keywordModel
    .find({ company: company })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await keywordModel.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    keywords,
  }
}
export const deleteKeyword = async (
  keywordId: string,
  userId: string,
): Promise<Keyword> => {
  const keyword = await keywordModel.findById(keywordId)
  if (!keyword) {
    throw new HttpNotFound('Keyword not found')
  }
  await checkCompanyOwner(userId, keyword.company.toString())
  await keywordModel.findByIdAndDelete(keywordId)
  return keyword
}

export const updateKeyword = async (
  id: string,
  payload: UpdateKeywordRequest,
  userId: string,
): Promise<Keyword> => {
  const keyword = await keywordModel.findById(id)
  if (!keyword) {
    throw new HttpNotFound('Keyword not found')
  }

  await checkCompanyOwner(userId, keyword.company.toString())
  keyword.label = payload.label
  keyword.icon = payload.icon
  await keyword.save()
  return keyword
}

export const getIKeywordById = async (
  id: string,
  userId: string,
): Promise<Keyword> => {
  const keyword = await keywordModel.findById(id)
  if (!keyword) {
    throw new HttpNotFound('keyword not found')
  }
  await checkCompanyOwner(userId, keyword.company.toString())
  return keyword
}

export const searchKeywords = async (
  pattern: string,
  companyId: string,
  pagination: PaginationParams,
): Promise<PaginatedKeywords> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const keywords = await keywordModel
    .find({ label: { $regex: pattern, $options: 'i' }, company: companyId })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await keywordModel
    .find({ label: { $regex: pattern, $options: 'i' }, company: companyId })
    .countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    keywords,
  }
}

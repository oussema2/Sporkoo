import { PaginationParams } from '../@types/common.types'
import {
  CreateItemRequest,
  ITemClientResponse,
  Item,
  PaginatedItems,
} from '../@types/item.types'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import { HttpDataConflict } from '../errors/http-data-data-conflict'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { HttpNotFound } from '../errors/http-not-found.error'
import catalogModel from '../models/catalog.model'
import itemModel from '../models/item.model'
import { checkCompanyOwner } from '../routes/companies.routes'
import { isItem } from './catalog.service'

export const createItem = async (
  payload: CreateItemRequest,
  userId: string,
): Promise<Item> => {
  await checkCompanyOwner(userId, payload.company.toString())
  const item = await itemModel.find({
    name: payload.name,
    company: payload.company,
  })
  if (item.length > 0) {
    throw new HttpDataConflict('item already exist', 'item')
  }
  return await itemModel.create(payload)
}
export const updateItem = async (
  payload: CreateItemRequest,
  id: string,
  userId: string,
): Promise<Item> => {
  await checkCompanyOwner(userId, payload.company.toString())
  const item = await itemModel.find({
    name: payload.name,
    company: payload.company,
  })
  if (item.length > 0) {
    throw new HttpDataConflict('item already exist', 'item')
  }
  const updateResponse = await itemModel.findByIdAndUpdate(id, payload, {
    new: true,
  })
  if (!updateResponse) {
    throw new HttpNotFound('Item not found')
  }
  return updateResponse
}

export const getItemById = async (id: string): Promise<Item> => {
  const item = await itemModel
    .findById(id)
    .populate('ingredients')
    .populate('allergens')
    .populate('keywords')
  if (!item) {
    throw new HttpNotFound('Item not found')
  }
  return item
}

export const getItems = async (
  companyId: string,
  pagination: PaginationParams,
): Promise<PaginatedItems> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const items = await itemModel
    .find({ company: companyId })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })

  const totalItems = await itemModel.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    items,
  }
}

export const deleteItem = async (id: string): Promise<Item> => {
  const deleteResponse = await itemModel.findByIdAndDelete(id)
  if (!deleteResponse) {
    throw new HttpNotFound('Item not found')
  }
  return deleteResponse
}
export const getItemByCatalog = async (
  catalogName: string,
  brancheId: string,
  itemId: string,
): Promise<ITemClientResponse> => {
  const catalog = await catalogModel
    .findOne({ name: catalogName, branch: brancheId })
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  let sectionRes: string = ''
  for (let i = 0; i < catalog.sections.length; i++) {
    const section = catalog.sections[i]
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j].item
      if (!isItem(item)) {
        throw new HttpForbidden("Can't get item details")
      }
      if (item._id.toString() === itemId) {
        sectionRes = section.name
      }
    }
  }
  const item = await itemModel
    .findById(itemId)
    .populate('ingredients')
    .populate('allergens')
    .populate('branch')
    .populate('company')
  if (!item) {
    throw new HttpNotFound('Item Not found')
  }
  return { item: item, section: sectionRes }
}

export const searchItems = async (
  pattern: string,
  companyId: string,
  pagination: PaginationParams,
): Promise<PaginatedItems> => {
  const { limit, page } = pagination
  if (isNaN(limit) || isNaN(page)) {
    throw new HttpBadRequest('limit or page are invalid')
  }
  const skip = (page - 1) * limit
  const items = await itemModel
    .find({ name: { $regex: pattern, $options: 'i' }, company: companyId })
    .skip(skip)
    .limit(limit)
    .sort({
      created_at: -1,
    })
  const totalItems = await itemModel
    .find({ name: { $regex: pattern, $options: 'i' }, company: companyId })
    .countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalPages,
    totalItems,
    items,
  }
}

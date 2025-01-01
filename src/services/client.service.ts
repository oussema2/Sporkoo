import { ObjectId } from 'mongodb'
import { ClientCatalogResponse, SectionItem } from '../@types/catalog.types'
import { HttpNotFound } from '../errors/http-not-found.error'
import branchModel from '../models/branch.model'
import catalogModel from '../models/catalog.model'
import companyModel from '../models/company.model'
import { isItem } from './catalog.service'
import { HttpForbidden } from '../errors/http-forbidden.error'
import itemModel from '../models/item.model'
import { Item } from '../@types/item.types'

export function isSectionItem(
  value: ObjectId | SectionItem,
): value is SectionItem {
  return (
    value && typeof value === 'object' && 'item' in value && isItem(value.item)
  )
}

export const getMenuForClient = async (
  companyName: string,
): Promise<ClientCatalogResponse> => {
  const company = await companyModel.findOne({ name: companyName })
  if (!company) {
    throw new HttpNotFound('Company Not Found')
  }
  const branch = await branchModel.findOne({ company: company._id })
  if (!branch) {
    throw new HttpNotFound('Branch Not Found')
  }
  const catalog = await catalogModel
    .findOne({ branch: branch._id })
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  const sections = catalog.sections.map(section => ({
    ...section,
    items: section.items.filter(item => item.actif),
  }))
  catalog.sections = sections
  return { branch, company, catalog }
}

export const getItemsBySection = async (
  catalogId: string,
  sectionId: string,
): Promise<SectionItem[]> => {
  const catalog = await catalogModel
    .findById(catalogId)
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog Not Found')
  }
  const [section] = catalog.sections
    .filter(section => section._id.toString() === sectionId)
    .map(sec => {
      return { ...sec, items: sec.items.filter(ite => ite.actif) }
    })
  if (!section) {
    throw new HttpNotFound('Section Not found')
  }
  if (section.items.length === 0) {
    return []
  }
  if (!isSectionItem(section.items[0])) {
    throw new HttpForbidden('Forbidden, no items')
  }
  return section.items
}

export const getItemByIdClient = async (id: string): Promise<Item> => {
  const item = await itemModel
    .findById(id)
    .populate('ingredients')
    .populate('allergens')
    .populate('branch')
    .populate('company')
  if (!item) {
    throw new HttpNotFound('Item not found')
  }
  return item
}

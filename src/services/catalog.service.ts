import {
  Catalog,
  CatalogEssentials,
  CreateCatalogRequest,
  CreateSectionRequest,
  GenerateQrCodeResponse,
  InitiateCatalogRequest,
  Section,
  UpdateCatalogNameRequest,
  UpdateSectionNameRequest,
} from '../@types/catalog.types'
import { HttpBaseError } from '../errors/http-base.error'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { HttpNotFound } from '../errors/http-not-found.error'
import catalogModel from '../models/catalog.model'
import { checkBranchOwner, getBranchesByCompany } from './branch.service'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import { checkCompanyOwner } from '../routes/companies.routes'
import { Item } from '../@types/item.types'
import { ObjectId } from 'mongodb'
import { Branch } from '../@types/branch.types'
import * as QrCode from 'qrcode'
import companyModel from '../models/company.model'
import allergenModel from '../models/allergen.model'
import keywordModel from '../models/keyword.model'
import { getCompany } from './company.service'
export function isItem(value: ObjectId | Item): value is Item {
  return value && typeof value === 'object' && 'variations' in value
}

function isBranch(value: ObjectId | Branch): value is Branch {
  return value && typeof value === 'object' && 'company' in value
}

export const createCatalog = async (
  payload: CreateCatalogRequest,
  userId: string,
): Promise<Catalog> => {
  await checkBranchOwner(userId, payload.branch.toString())
  return await catalogModel.create(payload)
}

export const getCatalogById = async (
  id: string,
  userId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel
    .findById(id)
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }

  await checkBranchOwner(userId, catalog.branch.toString())
  return catalog
}

export const initiateCatalog = async (
  payload: InitiateCatalogRequest,
  userId: string,
): Promise<Catalog> => {
  await checkBranchOwner(userId, payload.branch.toString())
  return await catalogModel.create(payload)
}

export const createSection = async (
  catalogId: string,
  section: CreateSectionRequest,
  userId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel.findById(catalogId)
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  await checkBranchOwner(userId, catalog?.branch.toString())
  return await insertNewSection(catalogId, section.order, section)
}

const insertNewSection = async (
  catalogId: string,
  sectionIndex: number,
  newSection: Section,
): Promise<Catalog> => {
  try {
    const catalog = await catalogModel.findById(catalogId)

    if (!catalog) {
      throw new HttpNotFound('Catalog not found')
    }

    catalog.sections.splice(sectionIndex, 0, newSection)
    catalog.sections = catalog.sections.map((section, index) => {
      return { ...section, order: index, description: section.description }
    })
    const updatedCatalog: Catalog = await catalog.save()
    return updatedCatalog
  } catch (error) {
    console.log(error)
    throw new HttpBaseError('Error ', 400)
  }
}

export const swapSections = async (
  catalogId: string,
  sectionId: string,
  order: number,
  userId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel.findById(catalogId)
  if (!catalog) {
    throw new HttpNotFound('Catalog Not found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  const section = catalog.sections.filter(
    section => section._id.toString() === sectionId,
  )[0]
  if (!section) {
    throw new HttpNotFound('Section Not found')
  }
  return moveSectionToIndex(catalogId, section._id.toString(), order)
}
const moveSectionToIndex = async (
  catalogId: string,
  sectionId: string,
  newIndex: number,
): Promise<Catalog> => {
  try {
    const catalog = await catalogModel.findById(catalogId)

    if (!catalog) {
      throw new HttpNotFound('Catalog not found')
    }

    const sectionIndex = catalog.sections.findIndex(
      section => section._id.toString() === sectionId,
    )

    if (sectionIndex === -1) {
      throw new HttpForbidden('Forbidden')
    }

    if (newIndex < 0 || newIndex >= catalog.sections.length) {
      throw new HttpForbidden('Invalid new index')
    }

    const movedSection = catalog.sections.splice(sectionIndex, 1)[0]

    catalog.sections.splice(newIndex, 0, movedSection)
    catalog.sections = catalog.sections.map((section, index) => {
      return { ...section, order: index }
    })

    const updatedCatalog: Catalog = await catalog.save()
    return updatedCatalog
  } catch (error) {
    throw new HttpBaseError('Error ', 400)
  }
}

export const getCatalogsByCompany = async (
  companyId: string,
  userId: string,
): Promise<Catalog[]> => {
  await checkCompanyOwner(userId, companyId)
  const company = await getCompany(companyId)

  const branches = await getBranchesByCompany(company._id.toString())
  const catalogs: Catalog[] = []
  for (let i = 0; i < branches.length; i++) {
    const currBranche = branches[i]
    const resCatalogs = await getCatalogsByBranche(currBranche._id.toString())
    Array.prototype.push.apply(catalogs, resCatalogs)
  }

  console.log(catalogs)
  return catalogs
}
export const getCatalogsByBranche = async (
  branchId: string,
): Promise<Catalog[]> => {
  return await catalogModel.find({ branch: branchId }).populate('branch')
}

export const updateSectionName = async (
  catalogId: string,
  payload: UpdateCatalogNameRequest,
  userId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel.findById(catalogId)
  if (!catalog) {
    throw new HttpNotFound('Catalog Not Found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  catalog.name = payload.name
  await catalog.save()
  return catalog
}

export const deleteSection = async (
  catalogId: string,
  sectionId: string,
  userId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel.findById(catalogId)
  if (!catalog) {
    throw new HttpNotFound('Catalog Not Found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  try {
    const newSections = catalog.sections
      .filter(sec => sec._id.toString() !== sectionId)
      .map((sec, index) => {
        return {
          ...sec,
          order: index,
        }
      })
    catalog.sections = newSections
    await catalog.save()
    return catalog
  } catch (error) {
    throw new HttpBadRequest('error HttpBadRequest')
  }
}

export const pushItemToSection = async (
  item: Item,
  catalogId: string,
  sectionId: string,
): Promise<Catalog> => {
  const catalog = await catalogModel.findById(catalogId)

  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  const updatedSection = catalog.sections.map(section => {
    if (section._id.toString() === sectionId) {
      const items = [
        ...section.items,
        { order: 99, item: item._id, actif: true },
      ].map((item, index) => {
        return { ...item, order: index }
      })
      return { ...section, items: items }
    } else {
      return section
    }
  })
  catalog.sections = updatedSection
  await catalog.save()
  return await catalog.populate('sections.items.item')
}

export const getSection = async (catalogId: string, sectionId: string) => {
  const catalog = await catalogModel
    .findById(catalogId)
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }

  const sections = catalog.sections
  const resultSection = sections.filter(
    section => section._id.toString() === sectionId,
  )[0]
  if (!resultSection) {
    throw new HttpNotFound('Section not found')
  }
  return resultSection
}

export const removeItem = async (
  catalogId: string,
  sectionId: string,
  itemId: string,
  userId: string,
): Promise<Section> => {
  const catalog = await catalogModel
    .findById(catalogId)
    .populate('sections.items.item')
  if (!catalog) {
    throw new HttpNotFound('Catalog Not Found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  const sections: Section[] = catalog.sections.map(section => {
    if (section._id.toString() === sectionId) {
      return {
        ...section,
        items: section.items
          .filter(item => {
            if (isItem(item.item)) {
              return item.item._id.toString() !== itemId
            }
          })
          .map((item, index) => {
            return { ...item, order: index }
          }),
      }
    } else {
      return section
    }
  })
  catalog.sections = sections
  await catalog.save()
  return catalog.sections.filter(
    section => section._id.toString() === sectionId,
  )[0]
}

export const changeSectionName = async (
  payload: UpdateSectionNameRequest,
  catalogId: string,
  sectionId: string,
  userId: string,
): Promise<Section> => {
  const catalog = await catalogModel.findById(catalogId)
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  const sections: Section[] = catalog.sections.map(section => {
    if (section._id.toString() === sectionId) {
      return { ...section, name: payload.name }
    } else {
      return section
    }
  })
  catalog.sections = sections
  await catalog.save()

  return catalog.sections.filter(
    section => section._id.toString() === sectionId,
  )[0]
}
export const generateQrCode = async (
  catalogId: string,
  userId: string,
): Promise<GenerateQrCodeResponse> => {
  const catalog = await catalogModel
    .findById(catalogId)
    .populate('branch')
    .populate('branch.company')
  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  if (!isBranch(catalog.branch)) {
    throw new HttpBadRequest("Forbidden, Can't generate QrCode no branch")
  }
  await checkBranchOwner(userId, catalog.branch._id.toString())
  if (!process.env.QRCODE_BASE_PATH) {
    throw new HttpBadRequest("Forbidden, can't generate QrCode")
  }
  const company = await companyModel.findById(catalog.branch.company)
  if (!company) {
    throw new HttpNotFound('Company Not Found')
  }

  const qrCodeText = `${process.env.QRCODE_BASE_PATH}/${company.name}`
  const qrCodeBuffer = await QrCode.toBuffer(qrCodeText, {
    type: 'png',
    width: 1080,
  })
  return { qrcode: qrCodeBuffer }
}

export const toggleItem = async (
  catalogId: string,
  itemId: string,
  sectionId: string,
  userId: string,
): Promise<Section> => {
  const catalog = await catalogModel.findById(catalogId)

  if (!catalog) {
    throw new HttpNotFound('Catalog not found')
  }
  await checkBranchOwner(userId, catalog.branch.toString())
  const sections: Section[] = catalog.sections.map(section => {
    if (section._id.toString() === sectionId) {
      return {
        ...section,
        items: section.items
          .map(item => {
            if (item.item.toString() === itemId) {
              return {
                ...item,
                actif: !item.actif,
              }
            } else {
              return item
            }
          })
          .map((item, index) => {
            return { ...item, order: index }
          }),
      }
    }
    return section
  })

  catalog.sections = sections
  await catalog.save()
  const [resultSection] = catalog.sections.filter(section => {
    if (section._id.toString() === sectionId) {
      return section
    }
  })
  if (!resultSection) {
    throw new HttpNotFound('Section Not Found')
  }
  return resultSection
}

export const getCatalogsEssentials = async (
  companyId: string,
  userId: string,
): Promise<CatalogEssentials> => {
  await checkCompanyOwner(userId, companyId)
  const allergens = await allergenModel.find()
  const keywords = await keywordModel.find({ company: companyId })
  return {
    allergens,
    keywords,
  }
}

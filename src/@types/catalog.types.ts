import { z } from 'zod'
import {
  CatalogSchema,
  CreateCatalogeSchema,
  CreateItemForSectionSchema,
  CreateSectionSchema,
  SectionSchema,
  UpdateCatalogNameSchema,
  UpdateSectionNameSchema,
  initiateCatalogueSchema,
} from '../schemas/catalog.schema'
import { ObjectId } from 'mongodb'
import { Company } from './company.types'
import { Branch } from './branch.types'
import { Item } from './item.types'
import { Allergen } from './allergen.types'
import { Keyword } from './keyword.types'

export type Catalog = z.infer<typeof CatalogSchema>
export type CreateCatalogRequest = z.infer<typeof CreateCatalogeSchema>
export type InitiateCatalogRequest = z.infer<typeof initiateCatalogueSchema>
export type CreateSectionRequest = z.infer<typeof CreateSectionSchema>
export type CreateItemForSectionRequest = z.infer<
  typeof CreateItemForSectionSchema
>
export type UpdateCatalogNameRequest = z.infer<typeof UpdateCatalogNameSchema>
export type SectionItem = {
  order: number
  item: ObjectId | Item
}

export type Section = z.infer<typeof SectionSchema>
export type UpdateSectionNameRequest = z.infer<typeof UpdateSectionNameSchema>
export type GenerateQrCodeResponse = {
  qrcode: Buffer
}
export type ClientCatalogResponse = {
  catalog: Catalog
  company: Company
  branch: Branch
}
export type CatalogEssentials = {
  allergens: Allergen[]
  keywords: Keyword[]
}

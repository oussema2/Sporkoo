import { z } from 'zod'
import {
  AllergenSchema,
  CreateAllergenSchema,
} from '../schemas/allergen.schema'
import { Pagination } from './common.types'

export type Allergen = z.infer<typeof AllergenSchema>
export type CreateAllergenRequest = z.infer<typeof CreateAllergenSchema>
export type PaginatedAllergens = Pagination & {
  allergens: Allergen[]
}

export enum InitialAllergens {
  'Arachide',
  'Céleri',
  'Crustacés',
  'Céréales contenant du Gluten',
  'Fruits à coque',
  'Lait',
  'Lupîn',
  'Oeuf',
  'Poisson',
  'Mollusques',
  'Moutarde',
  'Sésame',
  'Soja',
  'Sulfites',
}

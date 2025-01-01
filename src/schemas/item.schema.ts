import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { CompanySchema } from './company.schema'
import { IngredientSchema } from './ingredient.schema'
import { KeywordSchema } from './keyword.schema'
import { AllergenSchema } from './allergen.schema'

const ItemVariation = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  label: z.string({ required_error: 'Item variation name required' }),
  price: z.string({ required_error: 'Item variation price required' }),
})

export const ItemSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Product Name missing' }),
  description: z
    .string({ required_error: 'Item description is missing' })
    .default(''),
  company: z
    .string({ required_error: 'Company is missing' })
    .transform(value => new ObjectId(value))
    .or(CompanySchema),
  ingredients: z.array(
    z
      .string()
      .transform(value => new ObjectId(value))
      .or(IngredientSchema),
  ),
  keywords: z.array(
    z
      .string()
      .transform(value => new ObjectId(value))
      .or(KeywordSchema),
  ),
  allergens: z.array(
    z
      .string()
      .transform(value => new ObjectId(value))
      .or(AllergenSchema),
  ),
  variations: z.array(ItemVariation),
  branch: z.string().transform(value => new ObjectId(value)),
  image: z.string({ required_error: 'Item image missing' }).default(''),
  available: z.boolean().default(true),
})

export const CreateItemSchema = ItemSchema.pick({
  description: true,
  company: true,
  ingredients: true,
  variations: true,
  image: true,
  name: true,
  branch: true,
  allergens: true,
  keywords: true,
})
export const AddItemSchema = ItemSchema.pick({
  _id: true,
})

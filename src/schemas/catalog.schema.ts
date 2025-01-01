import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { BranchSchema } from './branch.schema'
import { ItemSchema } from './item.schema'

export const SectionItemSchema = z.object({
  actif: z.boolean().default(true),
  order: z.number({ required_error: 'Item order is missing' }),
  item: z
    .string()
    .transform(value => new ObjectId(value))
    .or(ItemSchema),
})
export const SectionSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  order: z.number({ required_error: 'Section order is missing' }),
  name: z.string({ required_error: 'Section name is missing' }),
  items: z.array(SectionItemSchema).default([]),
  description: z.string({ required_error: 'Section description' }),
})

export const CatalogSchema = z.object({
  _id: z
    .string()
    .optional()
    .transform(value => new ObjectId(value)),
  name: z.string({ required_error: 'Catalog name is missing' }),
  branch: z
    .string()
    .transform(value => new ObjectId(value))
    .or(BranchSchema),
  days: z.array(z.string()),
  startTime: z
    .string({ required_error: 'Menu start time is missing' })
    .transform(value => new Date(value)),
  endTime: z
    .string({ required_error: 'Menu end time is missing' })
    .transform(value => new Date(value)),
  sections: z.array(SectionSchema).default([]),
  available: z.boolean().default(true),
})

export const CreateCatalogeSchema = CatalogSchema.pick({
  name: true,
  branch: true,
  days: true,
  startTime: true,
  endTime: true,
  sections: true,
})

export const initiateCatalogueSchema = CatalogSchema.pick({
  name: true,
  branch: true,
  days: true,
  startTime: true,
  endTime: true,
})

export const CreateSectionSchema = SectionSchema.pick({
  name: true,
  order: true,
  items: true,
  _id: true,
  description: true,
})

export const UpdateCatalogNameSchema = CatalogSchema.pick({
  name: true,
})

export const CreateItemForSectionSchema = SectionItemSchema.pick({
  order: true,
})
export const UpdateSectionNameSchema = SectionSchema.pick({
  name: true,
})

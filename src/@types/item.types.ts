import { z } from 'zod'
import {
  AddItemSchema,
  CreateItemSchema,
  ItemSchema,
} from '../schemas/item.schema'
import { Pagination } from './common.types'

export type Item = z.infer<typeof ItemSchema>
export type CreateItemRequest = z.infer<typeof CreateItemSchema>
export type AddItemRequest = z.infer<typeof AddItemSchema>
export type ITemClientResponse = { item: Item; section: string }
export type PaginatedItems = Pagination & {
  items: Item[]
}

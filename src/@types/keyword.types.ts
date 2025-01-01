import { z } from 'zod'
import {
  CreateKeywordSchema,
  KeywordSchema,
  UpdateKeywordSchema,
} from '../schemas/keyword.schema'
import { Pagination } from './common.types'

export type Keyword = z.infer<typeof KeywordSchema>
export type CreateKeywordRequest = z.infer<typeof CreateKeywordSchema>

export type PaginatedKeywords = Pagination & {
  keywords: Keyword[]
}
export type UpdateKeywordRequest = z.infer<typeof UpdateKeywordSchema>

import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import { Keyword, PaginatedKeywords } from '../@types/keyword.types'
import {
  CreateKeywordSchema,
  UpdateKeywordSchema,
} from '../schemas/keyword.schema'
import {
  createKeyword,
  deleteKeyword,
  getIKeywordById,
  getKeywordsByCompany,
  searchKeywords,
  updateKeyword,
} from '../services/keyword.service'
import { CrudParamsType } from '../@types/common.types'
import isAuthenticated from '../middlewares/is-authenticated'
import { PaginationParams } from '../@types/common.types'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)

  app.post('/', async (request): Promise<Keyword> => {
    const payload = CreateKeywordSchema.parse(request.body)
    return await createKeyword(payload, request.user._id.toString())
  })
  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Keyword> => {
      const { id } = request.params
      const payload = UpdateKeywordSchema.parse(request.body)
      return await updateKeyword(id, payload, request.user._id.toString())
    },
  )
  app.get(
    '/company/:id/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType & PaginationParams
      }>,
    ): Promise<PaginatedKeywords> => {
      const { id, limit, page } = request.params

      return getKeywordsByCompany(
        id,
        { limit: Number(limit), page: Number(page) },
        request.user._id.toString(),
      )
    },
  )
  app.get(
    '/company/:id/search/:pattern/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType & PaginationParams & { pattern: string }
      }>,
    ): Promise<PaginatedKeywords> => {
      const { id, limit, page, pattern } = request.params

      return searchKeywords(pattern, id, {
        limit: Number(limit),
        page: Number(page),
      })
    },
  )
  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Keyword> => {
      const { id } = request.params
      return await getIKeywordById(id, request.user._id.toString())
    },
  )
  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Keyword> => {
      const { id } = request.params
      return deleteKeyword(id, request.user._id.toString())
    },
  )
  done()
}

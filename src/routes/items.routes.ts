import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import { Item, PaginatedItems } from '../@types/item.types'
import { CreateItemSchema } from '../schemas/item.schema'
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  searchItems,
  updateItem,
} from '../services/item.service'
import { CrudParamsType } from '../@types/common.types'
import isAuthenticated from '../middlewares/is-authenticated'
import { PaginationParams } from '../@types/common.types'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.post('/', async (request): Promise<Item> => {
    const payload = CreateItemSchema.parse(request.body)

    return await createItem(payload, request.user._id.toString())
  })
  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Item> => {
      const { id } = request.params
      const payload = CreateItemSchema.parse(request.body)

      return await updateItem(payload, id, request.user._id.toString())
    },
  )
  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Item> => {
      const { id } = request.params
      return await getItemById(id)
    },
  )
  app.get(
    '/company/:id/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType & PaginationParams
      }>,
    ): Promise<PaginatedItems> => {
      const { id, limit, page } = request.params
      return await getItems(id, { limit: Number(limit), page: Number(page) })
    },
  )
  app.get(
    '/company/:id/search/:pattern/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: { pattern: string; id: string } & PaginationParams
      }>,
    ): Promise<PaginatedItems> => {
      const { pattern, limit, page, id } = request.params
      return await searchItems(pattern, id, {
        limit: Number(limit),
        page: Number(page),
      })
    },
  )

  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Item> => {
      const { id } = request.params
      return await deleteItem(id)
    },
  )

  done()
}

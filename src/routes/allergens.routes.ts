import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import { Allergen, PaginatedAllergens } from '../@types/allergen.types'
import isAuthenticated from '../middlewares/is-authenticated'
import { CreateAllergenSchema } from '../schemas/allergen.schema'
import {
  createAllergen,
  getAllergens,
  getPaginatedAllergens,
  searchallergens,
} from '../services/allergen.service'
import { PaginationParams } from '../@types/common.types'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.post('/', async (request): Promise<Allergen> => {
    const payload = CreateAllergenSchema.parse(request.body)
    return await createAllergen(payload)
  })
  app.get('/', async (): Promise<Allergen[]> => {
    return await getAllergens()
  })
  app.get(
    '/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: PaginatedAllergens
      }>,
    ): Promise<PaginatedAllergens> => {
      const { limit, page } = request.params

      return getPaginatedAllergens({ limit: Number(limit), page: Number(page) })
    },
  )
  app.get(
    '/search/:pattern/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: { pattern: string } & PaginationParams
      }>,
    ): Promise<PaginatedAllergens> => {
      const { pattern, limit, page } = request.params
      return await searchallergens(pattern, {
        limit: Number(limit),
        page: Number(page),
      })
    },
  )
  done()
}

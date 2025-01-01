import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import isAuthenticated from '../middlewares/is-authenticated'
import { Ingredient, PaginatedIngredients } from '../@types/ingredient.types'
import {
  CreateIngredientSchema,
  UpdateIngredientSchema,
} from '../schemas/ingredient.schema'
import {
  AddUnavailableIngredient,
  createIngredient,
  deleteIngredient,
  deleteUnavailable,
  getAllIngredientsByCompany,
  getIngredientById,
  getIngredientsByCompany,
  getUnavailableIngredientById,
  getUnavailableIngredientByIdByBranch,
  searchIngredients,
  searchUnavailableIngredients,
  updateIngredient,
  updateUnavailable,
} from '../services/ingredient.service'
import { CrudParamsType } from '../@types/common.types'
import { DeleteResult } from 'mongodb'
import {
  PaginatedUnailableIngredients,
  UnavailableIngredient,
} from '../@types/unavailable-ingredient.types'
import {
  CreateUnavailableIngredientSchema,
  UpdateUnavailableIngredientSchema,
} from '../schemas/unavailable-ingredient.schema'
import { PaginationParams } from '../@types/common.types'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.post('/', async (request): Promise<Ingredient> => {
    const payload = CreateIngredientSchema.parse(request.body)
    return await createIngredient(payload, request.user._id.toString())
  })

  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Ingredient> => {
      const { id } = request.params
      const payload = UpdateIngredientSchema.parse(request.body)
      return await updateIngredient(id, payload, request.user._id.toString())
    },
  )

  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<DeleteResult> => {
      const { id } = request.params
      return await deleteIngredient(id)
    },
  )

  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Ingredient> => {
      const { id } = request.params
      return await getIngredientById(id, request.user._id.toString())
    },
  )

  app.get(
    '/company/:id/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType & PaginationParams
        Querystring: { branch: string }
      }>,
    ): Promise<PaginatedIngredients | PaginatedUnailableIngredients> => {
      const { branch } = request.query
      const { id, limit, page } = request.params
      if (!branch) {
        return await getIngredientsByCompany(
          id,
          { limit: Number(limit), page: Number(page) },
          request.user._id.toString(),
        )
      } else {
        return await getUnavailableIngredientByIdByBranch(
          branch,
          { limit: Number(limit), page: Number(page) },
          request.user._id.toString(),
        )
      }
    },
  )
  app.get(
    '/company/:id/search/:pattern/page/:page/limit/:limit',
    async (
      request: FastifyRequest<{
        Params: { pattern: string } & CrudParamsType & PaginationParams
        Querystring: { branch: string }
      }>,
    ): Promise<PaginatedIngredients | PaginatedUnailableIngredients> => {
      const { branch } = request.query
      const { pattern, limit, page, id } = request.params
      if (!branch) {
        return await searchIngredients(pattern, id, {
          limit: Number(limit),
          page: Number(page),
        })
      } else {
        return await searchUnavailableIngredients(pattern, branch, {
          limit: Number(limit),
          page: Number(page),
        })
      }
    },
  )
  app.get(
    '/company/:id',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType
      }>,
    ): Promise<Ingredient[]> => {
      const { id } = request.params

      return await getAllIngredientsByCompany(id, request.user._id.toString())
    },
  )

  app.post('/unavailable', async (request): Promise<UnavailableIngredient> => {
    const payload = CreateUnavailableIngredientSchema.parse(request.body)
    return await AddUnavailableIngredient(payload, request.user._id.toString())
  })

  app.put(
    '/unavailable/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<UnavailableIngredient> => {
      const { id } = request.params
      const payload = UpdateUnavailableIngredientSchema.parse(request.body)
      return await updateUnavailable(id, payload, request.user._id.toString())
    },
  )

  app.delete(
    '/unavailable/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<DeleteResult> => {
      const { id } = request.params
      return await deleteUnavailable(id, request.user._id.toString())
    },
  )

  app.get(
    '/unavailable/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<UnavailableIngredient> => {
      const { id } = request.params
      return await getUnavailableIngredientById(id, request.user._id.toString())
    },
  )

  // app.get(
  //   '/unavailable/branch/:id',
  //   async (
  //     request: FastifyRequest<{ Params: CrudParamsType }>,
  //   ): Promise<UnavailableIngredient[]> => {
  //     const { id } = request.params
  //     return await getUnavailableIngredientByIdByBranch(
  //       id,
  //       request.user._id.toString(),
  //     )
  //   },
  // )
  done()
}

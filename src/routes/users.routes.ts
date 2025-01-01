import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import isAuthenticated from '../middlewares/is-authenticated'
import isOwner from '../middlewares/is-owner'
import { User } from '../@types/user.types'
import { CreateUserSchema, UpdateManagerSchema } from '../schemas/user.schema'
import {
  createManager,
  deleteManager,
  updateManager,
  getManagers,
  getUserById,
  getUsersForSuperAdmin,
} from '../services/user.service'
import { CrudParamsType } from '../@types/common.types'
import userModel from '../models/user.model'
import { HttpNotFound } from '../errors/http-not-found.error'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { DeleteResult } from 'mongodb'

const checkManagerCreatedByCurrentUser = async (
  userId: string,
  managerId: string,
): Promise<void> => {
  const manager = await userModel.findById(managerId)
  if (!manager) {
    throw new HttpNotFound('Manager Not Found')
  }
  if (manager.createdBy.toString() !== userId) {
    throw new HttpForbidden('Forbidden')
  }
}

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.addHook('preHandler', isOwner)

  app.post('/', async (request): Promise<User> => {
    const payload = CreateUserSchema.parse(request.body)
    return await createManager({
      ...payload,

      createdBy: request.user._id,
    })
  })
  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<User> => {
      const { id } = request.params
      await checkManagerCreatedByCurrentUser(request.user._id.toString(), id)
      const payload = UpdateManagerSchema.parse(request.body)
      return await updateManager(payload, id)
    },
  )

  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<DeleteResult> => {
      const { id } = request.params
      await checkManagerCreatedByCurrentUser(request.user._id.toString(), id)
      return deleteManager(id)
    },
  )

  app.get('/', async (request): Promise<User[]> => {
    return getManagers(request.user._id.toString())
  })
  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<User> => {
      const { id } = request.params
      await checkManagerCreatedByCurrentUser(request.user._id.toString(), id)
      return getUserById(id)
    },
  )
  app.get('/getAllUsers', async (request): Promise<User[]> => {
    console.log(request.user.role)
    if (request.user.role !== process.env.SUPER_ROLE) {
      throw new HttpForbidden(`Not  ${process.env.SUPER_ROLE}`)
    }
    return await getUsersForSuperAdmin()
  })
  done()
}

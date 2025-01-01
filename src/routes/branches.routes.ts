import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import isAuthenticated from '../middlewares/is-authenticated'
import { AddManagerParamsType, Branch } from '../@types/branch.types'
import { CreateBranchSchema, CreateWifiSchema } from '../schemas/branch.schema'
import {
  addManager,
  addWifiToBranch,
  checkBranchOwner,
  createBranch,
  deleteBranch,
  getBranchById,
  getBranchesByCompany,
  updateBranch,
} from '../services/branch.service'
import { CrudParamsType } from '../@types/common.types'
import { DeleteResult } from 'mongodb'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.post('/', async (request): Promise<Branch> => {
    const payload = CreateBranchSchema.parse(request.body)
    return await createBranch(payload)
  })
  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Branch> => {
      const { id } = request.params
      const payload = CreateBranchSchema.parse(request.body)

      return await updateBranch(id, payload, request.user._id.toString())
    },
  )

  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<DeleteResult> => {
      const { id } = request.params
      return await deleteBranch(id, request.user._id.toString())
    },
  )

  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Branch> => {
      const { id } = request.params
      return getBranchById(id, request.user._id.toString())
    },
  )

  app.post(
    '/:branchId/managers/:managerId',
    async (
      request: FastifyRequest<{ Params: AddManagerParamsType }>,
    ): Promise<Branch> => {
      const { branchId, managerId } = request.params

      return addManager(branchId, managerId, request.user._id.toString())
    },
  )
  app.post(
    '/:id/wifi',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Branch> => {
      const { id } = request.params
      await checkBranchOwner(request.user._id.toString(), id)
      const payload = CreateWifiSchema.parse(request.body)
      return addWifiToBranch(id, payload)
    },
  )

  app.get(
    '/getBranchesByCompany/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Branch[]> => {
      const { id } = request.params
      return getBranchesByCompany(id)
    },
  )

  done()
}

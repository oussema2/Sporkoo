import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import { Company } from '../@types/company.types'
import { CreateCompanySchema } from '../schemas/company.schema'
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompany,
  updateCompany,
} from '../services/company.service'
import isAuthenticated from '../middlewares/is-authenticated'
import companyModel from '../models/company.model'
import { HttpNotFound } from '../errors/http-not-found.error'
import { CrudParamsType } from '../@types/common.types'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { RegisterBranch } from '../schemas/branch.schema'
import { createBranch } from '../services/branch.service'
import { AuthenticatedUser } from '../@types/user.types'
import { authenticateRegisteredUser } from '../services/auth.service'

export const checkCompanyOwner = async (
  userId: string,
  companyId: string,
): Promise<void> => {
  const company = await companyModel.findById(companyId)
  if (!company) {
    throw new HttpNotFound('Company not found')
  }

  if (company.createdBy.toString() !== userId /* or is not admin */) {
    throw new HttpForbidden('Forbidden')
  }
}

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)

  app.post('/', async (request): Promise<Company> => {
    const payload = CreateCompanySchema.parse(request.body)
    return await createCompany(
      {
        ...payload,
      },
      request.user._id.toString(),
    )
  })

  app.post('/register-company', async (request): Promise<AuthenticatedUser> => {
    const companyPayload = CreateCompanySchema.parse(request.body)
    const company = await createCompany(
      {
        ...companyPayload,
      },
      request.user._id.toString(),
    )
    const branchPayload = RegisterBranch.parse(request.body)
    const branch = await createBranch({
      ...branchPayload,
      company: company._id,
    })
    if (!branch) {
      throw new HttpForbidden('Error in adding Branch')
    }

    return await authenticateRegisteredUser(request.user._id.toString())
  })

  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Company> => {
      const { id } = request.params

      await checkCompanyOwner(request.user._id.toString(), id)

      const payload = CreateCompanySchema.parse(request.body)
      return await updateCompany(payload, id)
    },
  )

  app.delete(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Company> => {
      const { id } = request.params

      await checkCompanyOwner(request.user._id.toString(), id)
      const deleteResponse = await deleteCompany(id)

      return deleteResponse
    },
  )

  app.get('/', async (request): Promise<Company[]> => {
    return getCompanies(request.user._id)
  })

  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Company> => {
      const { id } = request.params

      await checkCompanyOwner(request.user._id.toString(), id)

      return getCompany(id)
    },
  )
  done()
}

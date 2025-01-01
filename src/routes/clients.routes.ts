import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import { ClientCatalogResponse, SectionItem } from '../@types/catalog.types'
import {
  getItemByIdClient,
  getItemsBySection,
  getMenuForClient,
} from '../services/client.service'
import { CrudParamsType } from '../@types/common.types'
import { Item } from '../@types/item.types'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.get(
    '/company/:companyName',
    // '/company/:companyId/branch/:branchId',
    async (
      request: FastifyRequest<{ Params: { companyName: string } }>,
    ): Promise<ClientCatalogResponse> => {
      const { companyName } = request.params
      return await getMenuForClient(companyName)
    },
  )
  app.get(
    '/:catalogId/section/:sectionId',
    async (
      request: FastifyRequest<{
        Params: { catalogId: string; sectionId: string }
      }>,
    ): Promise<SectionItem[]> => {
      const { catalogId, sectionId } = request.params
      return await getItemsBySection(catalogId, sectionId)
    },
  )
  app.get(
    '/item/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Item> => {
      const { id } = request.params
      return await getItemByIdClient(id)
    },
  )

  done()
}

import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import isAuthenticated from '../middlewares/is-authenticated'
import { Catalog, CatalogEssentials, Section } from '../@types/catalog.types'
import {
  CreateCatalogeSchema,
  CreateSectionSchema,
  UpdateCatalogNameSchema,
  UpdateSectionNameSchema,
  initiateCatalogueSchema,
} from '../schemas/catalog.schema'
import {
  changeSectionName,
  createCatalog,
  createSection,
  deleteSection,
  generateQrCode,
  getCatalogById,
  getCatalogsByCompany,
  getCatalogsEssentials,
  getSection,
  initiateCatalog,
  pushItemToSection,
  removeItem,
  swapSections,
  toggleItem,
  updateSectionName,
} from '../services/catalog.service'
import { CrudParamsType } from '../@types/common.types'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { AddItemSchema, CreateItemSchema } from '../schemas/item.schema'
import { createItem, getItemById } from '../services/item.service'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)

  app.post('/', async (request): Promise<Catalog> => {
    const payload = CreateCatalogeSchema.parse(request.body)
    return await createCatalog(payload, request.user._id.toString())
  })

  app.post('/initiate', async (request): Promise<Catalog> => {
    const payload = initiateCatalogueSchema.parse(request.body)
    return await initiateCatalog(payload, request.user._id.toString())
  })
  app.post(
    '/:id/section',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Catalog> => {
      const { id } = request.params
      const section = CreateSectionSchema.parse(request.body)
      return await createSection(id, section, request.user._id.toString())
    },
  )
  app.post(
    '/:catalog/section/:section/pushProduct/create',
    async (
      request: FastifyRequest<{ Params: { catalog: string; section: string } }>,
    ): Promise<Catalog> => {
      const { catalog, section } = request.params
      const itemPayload = CreateItemSchema.parse(request.body)

      const item = await createItem(itemPayload, request.user._id.toString())
      return await pushItemToSection(item, catalog, section)
    },
  )
  app.put(
    '/:catalog/section/:section/pushProduct',
    async (
      request: FastifyRequest<{ Params: { catalog: string; section: string } }>,
    ): Promise<Catalog> => {
      const { catalog, section } = request.params
      const itemPayload = AddItemSchema.parse(request.body)
      const item = await getItemById(itemPayload._id.toString())
      return await pushItemToSection(item, catalog, section)
    },
  )
  app.put(
    '/updateName/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Catalog> => {
      const { id } = request.params
      const payload = UpdateCatalogNameSchema.parse(request.body)
      return await updateSectionName(id, payload, request.user._id.toString())
    },
  )

  app.put(
    '/:id/swap',
    async (
      request: FastifyRequest<{
        Params: CrudParamsType
        Querystring: { section: string; order: number }
      }>,
    ): Promise<Catalog> => {
      const { order, section } = request.query
      const { id } = request.params
      if (!order || !section) {
        throw new HttpForbidden('Forbidden')
      }
      return await swapSections(id, section, order, request.user._id.toString())
    },
  )
  app.put(
    '/:catalog/section/:section/remove-item/:item',
    async (
      request: FastifyRequest<{
        Params: { catalog: string; section: string; item: string }
      }>,
    ): Promise<Section> => {
      const { catalog, item, section } = request.params
      return await removeItem(
        catalog,
        section,
        item,
        request.user._id.toString(),
      )
    },
  )

  app.put(
    '/:catalog/section/:section/update-name',
    async (
      request: FastifyRequest<{ Params: { catalog: string; section: string } }>,
    ): Promise<Section> => {
      const { catalog, section } = request.params
      const payload = UpdateSectionNameSchema.parse(request.body)
      return await changeSectionName(
        payload,
        catalog,
        section,
        request.user._id.toString(),
      )
    },
  )
  app.put(
    '/:catalog/section/:section/toggle-item-actif/:item',
    async (
      request: FastifyRequest<{
        Params: { catalog: string; item: string; section: string }
      }>,
    ): Promise<Section> => {
      const { catalog, item, section } = request.params
      return await toggleItem(
        catalog,
        item,
        section,
        request.user._id.toString(),
      )
    },
  )

  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Catalog> => {
      const { id } = request.params
      const catalog = await getCatalogById(id, request.user._id.toString())

      return catalog
    },
  )

  app.get(
    '/getByCompany/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<Catalog[]> => {
      const { id } = request.params
      return await getCatalogsByCompany(id, request.user._id.toString())
    },
  )
  app.get(
    '/:catalog/section/:section/getSection',
    async (
      request: FastifyRequest<{ Params: { catalog: string; section: string } }>,
    ): Promise<Section> => {
      const { catalog, section } = request.params
      return await getSection(catalog, section)
    },
  )
  app.get(
    '/qr-code/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
      reply,
    ): Promise<void> => {
      const { id } = request.params
      const bufferResponse = await generateQrCode(
        id,
        request.user._id.toString(),
      )
      reply.type('image/png').send(bufferResponse.qrcode)
    },
  )
  app.get(
    '/essential-data/company/:id',
    async (
      request: FastifyRequest<{ Params: CrudParamsType }>,
    ): Promise<CatalogEssentials> => {
      const { id } = request.params
      return getCatalogsEssentials(id, request.user._id.toString())
    },
  )
  app.delete(
    '/:catalog/section/:section',
    async (
      request: FastifyRequest<{ Params: { catalog: string; section: string } }>,
    ): Promise<Catalog> => {
      const { catalog, section } = request.params
      return await deleteSection(catalog, section, request.user._id.toString())
    },
  )

  done()
}

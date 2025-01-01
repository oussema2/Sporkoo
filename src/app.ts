import fastify, { FastifyInstance } from 'fastify'
import errorHandler from './middlewares/error-handler'
import authRoutes from './routes/auth.routes'
import todosRoutes from './routes/todos.routes'
import companiesRoutes from './routes/companies.routes'
import usersRoutes from './routes/users.routes'
import branchesRoutes from './routes/branches.routes'
import itemsRoutes from './routes/items.routes'
import catalogsRoutes from './routes/catalogs.routes'
import ingredientsRoutes from './routes/ingredients.routes'
import cors from '@fastify/cors'
import path from 'path'
import multipart from '@fastify/multipart'
import filesRoutes from './routes/files.routes'
import fastifyStatic from '@fastify/static'
import allergensRoutes from './routes/allergens.routes'
import clientRoutes from './routes/clients.routes'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import * as Sentry from '@sentry/node'
import { HttpForbidden } from './errors/http-forbidden.error'
import keywordRoutes from './routes/keywords.routes'
export default async function server(): Promise<FastifyInstance> {
  const app = fastify({ logger: true })
  await app.register(cors, {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  })

  app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/public/',
  })
  if (!process.env.SENTRY_DSN) {
    throw new HttpForbidden("Can't connect to sentry")
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  })
  Sentry.setupFastifyErrorHandler(app)
  app.register(multipart)
  app.setErrorHandler(errorHandler)
  app.register(todosRoutes, { prefix: 'todos' })
  app.register(keywordRoutes, { prefix: 'keywords' })
  app.register(companiesRoutes, { prefix: 'companies' })
  app.register(usersRoutes, { prefix: 'users' })
  app.register(branchesRoutes, { prefix: 'branches' })
  app.register(itemsRoutes, { prefix: 'items' })
  app.register(clientRoutes, { prefix: 'apis' })
  app.register(catalogsRoutes, { prefix: 'catalogs' })
  app.register(ingredientsRoutes, { prefix: 'ingredients' })
  app.register(allergensRoutes, { prefix: 'allergenes' })
  app.register(filesRoutes, { prefix: 'uploads' })
  app.register(authRoutes)
  return app
}

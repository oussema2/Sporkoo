import { FastifyInstance, RegisterOptions, FastifyError } from 'fastify'
import isAuthenticated from '../middlewares/is-authenticated'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
const pump = util.promisify(pipeline)

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.addHook('preHandler', isAuthenticated)
  app.post('/item', async request => {
    const parts = await request.files({
      limits: { fileSize: 99999 * 1024 * 1024 },
    })
    for await (const part of parts) {
      const imageName =
        part.filename.split('.')[0] +
        '-' +
        Date.now() +
        '.' +
        part.filename.split('.')[1]
      await pump(
        part.file,
        fs.createWriteStream(`${__dirname}/../../public/items/${imageName}`),
      )
      return { path: `/items/${imageName}` }
    }
  })
  done()
}

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { HttpBaseError } from '../errors/http-base.error'

export default (
  error: FastifyError,
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  if (process.env.APP_ENV === 'development') {
    console.error(error)
  }

  if (error instanceof ZodError) {
    reply
      .code(422)
      .send({ error: 'Validation Error', validations: error.issues })
  }

  if (error instanceof HttpBaseError) {
    reply
      .code(error.statusCode)
      .send({ error: error.message, errorCode: error.errorCode })
  }

  reply
    .code(500)
    .send({ error: 'Internal Server Error', message: error.message })
}

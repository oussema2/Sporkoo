import { verify } from 'jsonwebtoken'
import { UserJwtPayload } from '../@types/user.types'
import { FastifyReply, FastifyRequest } from 'fastify'
import { HttpUnauthorized } from '../errors/http-unauthorized.error'
import { HttpForbidden } from '../errors/http-forbidden.error'
import configProvider from '../utils/config'

export default (request: FastifyRequest, _: FastifyReply, next: () => void) => {
  const headers = request.headers.authorization
  if (!headers) {
    throw new HttpUnauthorized('Unauthorized')
  }
  const token = headers.split(' ')[1]
  if (!token) {
    throw new HttpUnauthorized('Unauthorized')
  }

  try {
    const decoded = verify(token, configProvider.secretKey) as UserJwtPayload
    request.user = decoded
    next()
  } catch (error) {
    console.log(error)

    throw new HttpForbidden('Forbidden Token  Expired')
  }
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { HttpUnauthorized } from '../errors/http-unauthorized.error'
const PERMITED_ROLES = ['owner', 'admin', 'super-admin']
export default (request: FastifyRequest, _: FastifyReply, next: () => void) => {
  if (!PERMITED_ROLES.includes(request.user.role)) {
    throw new HttpUnauthorized('Forbidden')
  }
  next()
}

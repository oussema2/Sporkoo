/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { UserJwtPayload } from './@types/user.types'

declare module 'fastify' {
  interface FastifyRequest {
    user: UserJwtPayload
  }
}

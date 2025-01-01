import {
  FastifyError,
  FastifyInstance,
  FastifyRequest,
  RegisterOptions,
} from 'fastify'
import {
  CreateUserSchema,
  UserLoginSchema,
  changeUserPasswordSchema,
} from '../schemas/user.schema'
import {
  AuthenticatedUser,
  ResendCodeResponse,
  User,
  UserJwtPayload,
  UserToken,
} from '../@types/user.types'
import {
  authenticateUser,
  changeUserPassword,
  forgetPassword,
  registerUser,
  resendCode,
  verifyUser,
} from '../services/auth.service'
import isAuthenticated from '../middlewares/is-authenticated'
import { HttpForbidden } from '../errors/http-forbidden.error'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.post('/register', async (request): Promise<AuthenticatedUser> => {
    const payload = CreateUserSchema.parse(request.body)
    return await registerUser(payload)
  })

  app.post('/auth', async (request): Promise<AuthenticatedUser> => {
    const payload = UserLoginSchema.parse(request.body)
    return await authenticateUser(payload)
  })

  app.get(
    '/verify',
    { preHandler: isAuthenticated },
    async (request): Promise<UserJwtPayload> => {
      return request.user
    },
  )
  app.get(
    '/forget-password-code',
    async (
      request: FastifyRequest<{
        Querystring: { email: string }
      }>,
    ): Promise<AuthenticatedUser> => {
      const { email } = request.query
      return await forgetPassword(email)
    },
  )

  app.get(
    '/verify/:code',
    { preHandler: isAuthenticated },
    async (request): Promise<UserToken> => {
      const { code } = request.params as { code: string }
      if (!code) {
        throw new HttpForbidden('Forbidden, Enter Code')
      }
      return await verifyUser(request.user._id.toString(), code)
    },
  )
  app.get(
    '/resend-code',
    { preHandler: isAuthenticated },
    async (request): Promise<ResendCodeResponse> => {
      return await resendCode(request.user._id.toString())
    },
  )

  app.put(
    '/change-password',
    { preHandler: isAuthenticated },
    async (request): Promise<User> => {
      const payload = changeUserPasswordSchema.parse(request.body)
      return await changeUserPassword(payload, request.user._id.toString())
    },
  )

  done()
}

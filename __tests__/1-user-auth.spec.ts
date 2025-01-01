import { FastifyInstance } from 'fastify'
import server from '../src/app'
import supertest from 'supertest'
import { CreateUserRequest, UserLoginRequest } from '../src/@types/user.types'
import mongoose from 'mongoose'
import { testDbConnect } from '../src/test/utils'
let app: FastifyInstance
let db: typeof mongoose
let token: string

describe('User register/auth test e2e', () => {
  beforeAll(async () => {
    db = await testDbConnect()
    app = await server()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await db.disconnect()
  })

  describe('User Register', () => {
    const payload: CreateUserRequest = {
      name: 'John Doe',
      email: 'test@gmail.com',
      password: '12345678',
    }

    it('POST /register should respond with user object', async () => {
      const response = await supertest(app.server)
        .post('/register')
        .send(payload)
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.name).toBe(payload.name)
    })

    it('POST /register should return a bad request error', async () => {
      const response = await supertest(app.server)
        .post('/register')
        .send(payload)
      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email already exists')
    })
  })

  describe('User Authenticate', () => {
    const payload: UserLoginRequest = {
      email: 'test@gmail.com',
      password: '12345678',
    }

    it('POST /auth should respond with Votre email et/ou mot de passe sont incorrectes', async () => {
      const response = await supertest(app.server)
        .post('/auth')
        .send({
          ...payload,
          password: '123456789',
        })
      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'Votre email et/ou mot de passe sont incorrectes',
      )
    })

    it('POST /auth should respond with token object', async () => {
      const response = await supertest(app.server).post('/auth').send(payload)
      token = response.body.token
      expect(response.status).toBe(200)
      expect(response.body.token).toBeTruthy()
    })

    it('GET /verify should respond with unauthorized', async () => {
      const response = await supertest(app.server).get('/verify').send()
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })

    it('GET /verify should respond with token object', async () => {
      const response = await supertest(app.server)
        .get('/verify')
        .set('authorization', `Bearer ${token}`)
        .send()
      expect(response.status).toBe(200)
      expect(response.body.email).toBe(payload.email)
    })

    it('GET /verify should respond with forbidden', async () => {
      const response = await supertest(app.server)
        .get('/verify')
        .set('authorization', `Bearer ${token}-test`)
        .send()
      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Forbidden')
    })
  })
})

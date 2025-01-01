import { FastifyInstance } from 'fastify'
import server from '../src/app'
import supertest from 'supertest'
import mongoose from 'mongoose'
import { testDbConnect } from '../src/test/utils'
let app: FastifyInstance
let db: typeof mongoose

describe('App test e2e', () => {
  beforeAll(async () => {
    db = await testDbConnect()
    app = await server()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await db.disconnect()
  })

  it('POST /todos should respond with todo object', async () => {
    const response = await supertest(app.server).post('/todos').send({
      name: 'test todo',
    })
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe(
      'application/json; charset=utf-8',
    )
    expect(response.body.name).toBe('test todo')
  })

  it('GET /todos should respond with todos array', async () => {
    const response = await supertest(app.server).get('/todos')
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe(
      'application/json; charset=utf-8',
    )
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toBe('test todo')
  })
})

import { FastifyInstance } from 'fastify'
import server from '../src/app'
import supertest from 'supertest'
import { Company } from '../src/@types/company.types'
import mongoose from 'mongoose'
import { testDbConnect } from '../src/test/utils'

let app: FastifyInstance
let db: typeof mongoose
let token: string
let notOwnerToken: string
let company: Company

describe('Companies test e2e', () => {
  beforeAll(async () => {
    db = await testDbConnect()
    app = await server()
    await app.ready()

    const response = await supertest(app.server).post('/auth').send({
      email: 'admin@esperoo.fr',
      password: '12345678',
    })
    token = response.body.token

    await supertest(app.server).post('/register').send({
      name: 'Company Not Owner',
      email: 'notowner@gmail.com',
      password: '12345678',
    })
    const notOwnerResponse = await supertest(app.server).post('/auth').send({
      email: 'notowner@gmail.com',
      password: '12345678',
    })
    notOwnerToken = notOwnerResponse.body.token
  })

  afterAll(async () => {
    await app.close()
    await db.disconnect()
  })

  describe('Company create', () => {
    it('POST /companies should respond unauthorized', async () => {
      const response = await supertest(app.server).post('/companies').send({
        name: 'Esperoo',
        adress: 'test adress',
      })
      expect(response.status).toBe(401)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.error).toBe('Unauthorized')
    })

    it('POST /companies should respond with company object', async () => {
      const response = await supertest(app.server)
        .post('/companies')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Esperoo',
          adress: 'test adress',
        })
      company = response.body
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.name).toBe('Esperoo')
    })
  })

  describe('Company delete ', () => {
    it('Delete /companies/:id should respond unauthorized', async () => {
      const response = await supertest(app.server).delete(
        `/companies/${company._id}`,
      )
      expect(response.status).toBe(401)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.error).toBe('Unauthorized')
    })

    it('DELETE /companies/:id should respond forbidden', async () => {
      const response = await supertest(app.server)
        .delete(`/companies/${company._id}`)
        .set('authorization', `Bearer ${notOwnerToken}`)
      expect(response.status).toBe(403)
    })

    it('DELETE /companies/:id should respond with company object', async () => {
      const response = await supertest(app.server)
        .delete(`/companies/${company._id}`)
        .set('authorization', `Bearer ${token}`)
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
    })
  })

  describe('Company update', () => {
    it('POST /companies/:id should respond with company object', async () => {
      const response = await supertest(app.server)
        .post('/companies')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Esperoo',
          adress: 'test adress',
        })
      company = response.body
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.name).toBe('Esperoo')
    })

    it('PUT /companies/:id should respond unauthorized', async () => {
      const response = await supertest(app.server)
        .put(`/companies/${company._id}`)
        .send({
          name: 'Esperoo updated',
          adress: 'test adress',
        })
      expect(response.status).toBe(401)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.error).toBe('Unauthorized')
    })

    it('PUT /companies/:id should respond forbidden', async () => {
      const response = await supertest(app.server)
        .put(`/companies/${company._id}`)
        .set('authorization', `Bearer ${notOwnerToken}`)
        .send({
          name: 'Esperoo updated',
          adress: 'test adress',
        })
      expect(response.status).toBe(403)
    })

    it('PUT /companies/:id should respond with company object', async () => {
      const response = await supertest(app.server)
        .put(`/companies/${company._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Esperoo updated',
          adress: 'test adress',
        })
      company = response.body
      expect(response.status).toBe(200)
      expect(response.header['content-type']).toBe(
        'application/json; charset=utf-8',
      )
    })
  })

  describe('get company', () => {
    it('GET /companies/:id should response unauthorised', async () => {
      const response = await supertest(app.server).get(
        `/companies/${company._id}`,
      )
      expect(response.status).toBe(401)
      expect(response.headers['content-type']).toBe(
        'application/json; charset=utf-8',
      )
      expect(response.body.error).toBe('Unauthorized')
    })

    it('GET /companies/:id should respond forbidden', async () => {
      const response = await supertest(app.server)
        .get(`/companies/${company._id}`)
        .set('authorization', `Bearer ${notOwnerToken}`)
      expect(response.status).toBe(403)
    })

    it('GET /companies/:id should response with company object', async () => {
      const response = await supertest(app.server)
        .get(`/companies/${company._id}`)
        .set('authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.name).toBe(company.name)
    })
  })

  describe('Get companies', () => {
    it('GET /companies should respond with company array', async () => {
      const response = await supertest(app.server)
        .get('/companies')
        .set('authorization', `Bearer ${token}`)
      expect(response.status).toBe(200)
      const companies: Array<Company> = response.body
      expect(companies.length).toBeGreaterThan(1)
      const companyFound = companies.find(c => c.name === company.name)
      expect(!!companyFound).toBe(true)
    })

    it('GET /companies should respond with company array', async () => {
      const response = await supertest(app.server)
        .get('/companies')
        .set('authorization', `Bearer ${notOwnerToken}`)
      expect(response.status).toBe(200)
      expect(response.body.length).toBe(0)
    })
  })
})

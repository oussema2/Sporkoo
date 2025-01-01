import {
  RegisterOptions,
  type FastifyInstance,
  FastifyError,
  FastifyRequest,
} from 'fastify'
import { type Todo, CreateTodoSchema } from '../schemas/todo.schema'
import { HttpNotFound } from '../errors/http-not-found.error'
import { ObjectId } from 'mongodb'
import todoModel from '../models/todo.model'

export default (
  app: FastifyInstance,
  _: RegisterOptions,
  done: (err?: FastifyError) => void,
): void => {
  app.get('/', async (): Promise<Todo[]> => {
    return await todoModel.find({})
  })

  app.post('/', async (request): Promise<Todo> => {
    const payload = CreateTodoSchema.parse(request.body)
    return await todoModel.create(payload)
  })

  app.get(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
    ): Promise<Todo> => {
      const { id } = request.params
      const todo = await todoModel.findById(new ObjectId(id))
      if (!todo) {
        throw new HttpNotFound('Todo not found')
      }
      return todo
    },
  )

  done()
}

import mongoose from 'mongoose'
import { Todo } from '../schemas/todo.schema'

const TodoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  done: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
})

export default mongoose.model<Todo>('Todo', TodoSchema)

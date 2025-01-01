import { HttpBaseError } from './http-base.error'

export class HttpUnauthorized extends HttpBaseError {
  constructor(message: string) {
    super(message, 401)
  }
}

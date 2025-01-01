import { HttpBaseError } from './http-base.error'

export class HttpNotFound extends HttpBaseError {
  constructor(message: string, errorCode?: string) {
    super(message, 404, errorCode)
  }
}

import { HttpBaseError } from './http-base.error'

export class HttpBadRequest extends HttpBaseError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, errorCode)
  }
}

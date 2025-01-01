import { HttpBaseError } from './http-base.error'

export class HttpDataConflict extends HttpBaseError {
  constructor(message: string, errorCode?: string) {
    super(message, 409, errorCode)
  }
}

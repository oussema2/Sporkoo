import { HttpBaseError } from './http-base.error'

export class HttpForbidden extends HttpBaseError {
  constructor(message: string, errorCode?: string) {
    super(message, 403, errorCode)
  }
}

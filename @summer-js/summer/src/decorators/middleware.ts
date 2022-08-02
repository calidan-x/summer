import { locContainer } from '../loc'
import { middlewareAssembler } from '../middleware'

export interface MiddlewareOptions {
  order: number
}
export const Middleware = (middlewareOptions: MiddlewareOptions) => (target: any) => {
  middlewareAssembler.add(target, middlewareOptions)
  locContainer.paddingLocClass(target)
}

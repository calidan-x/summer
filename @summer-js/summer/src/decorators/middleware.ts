import { IocContainer } from '../ioc'
import { middlewareAssembler } from '../middleware'

export interface MiddlewareOptions {
  order: number
}
export const Middleware = (middlewareOptions: MiddlewareOptions) => (target: any) => {
  middlewareAssembler.add(target, middlewareOptions)
  IocContainer.pendingIocClass(target)
}

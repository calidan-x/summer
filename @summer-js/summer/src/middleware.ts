import { MiddlewareOptions } from './decorators/middleware'
import { getInjectable } from './ioc'

export const middlewares: any[] = []
export const middlewareAssembler = {
  middlewareClasses: [],
  add(middleware, options: MiddlewareOptions) {
    middleware.options = options
    this.middlewareClasses.push(middleware)
    this.middlewareClasses.sort((a, b) => a.options.order - b.options.order)
  },
  init() {
    this.middlewareClasses.forEach((clz) => {
      middlewares.push(getInjectable(clz))
    })
  }
}

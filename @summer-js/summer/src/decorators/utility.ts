import { Context } from '../request-handler'

export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never
export type OmitFirstAndSecondArg<F> = F extends (a: any, b: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
export type ContextInvocation = WithRequired<Context, 'invocation'>

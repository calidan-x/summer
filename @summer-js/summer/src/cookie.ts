import { SerializeOptions, parse, serialize } from 'cookie'
import { Context, getContext } from '.'

export interface CookieItem {
  name: string
  value: string
  options?: SerializeOptions
}

const CookieItems = Symbol('Set-Cookies')

export const parseCookie = (ctx: Context) => {
  if (ctx.request.headers!.cookie) {
    ctx.cookies = parse(ctx.request.headers!.cookie) || {}
  }
}

export const assembleCookie = (ctx: Context) => {
  if (ctx[CookieItems] && ctx[CookieItems].length > 0) {
    ctx.response.headers['Set-Cookie'] = ctx[CookieItems].map((rc) => serialize(rc.name, rc.value, rc.options))
  }
}

export const Cookie = {
  get(name: string) {
    const context = getContext()
    if (context && context.cookies) {
      return context.cookies[name]
    }
    return undefined
  },
  getAll() {
    const context = getContext()
    if (context && context.cookies) {
      return context.cookies
    }
    return undefined
  },
  set(name: string, value: string, options?: SerializeOptions) {
    const context = getContext()
    if (context) {
      context.cookies = context.cookies || {}
      context.cookies[name] = value
      context[CookieItems] = context[CookieItems] || []
      context[CookieItems].push({ name, value, options })
    }
  },
  clear(name: string, domain?: string) {
    const context = getContext()
    if (context) {
      context[CookieItems].push({ name, value: '', options: { maxAge: 0, domain } })
    }
  }
}

import cookie, { CookieSerializeOptions } from 'cookie'
import { Context, getContext } from '.'

export interface CookieItem {
  name: string
  value: string
  options?: CookieSerializeOptions
}

export const responseCookies: CookieItem[] = []

export const parseCookie = (ctx: Context) => {
  if (ctx.request.headers!.cookie) {
    ctx.cookies = cookie.parse(ctx.request.headers!.cookie) || {}
  }
  responseCookies.splice(0, responseCookies.length)
}

export const assembleCookie = (ctx: Context) => {
  ctx.response.headers['Set-Cookie'] = responseCookies.map((rc) => cookie.serialize(rc.name, rc.value, rc.options))
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
  set(name: string, value: string, options?: CookieSerializeOptions) {
    const context = getContext()
    if (context) {
      context.cookies = context.cookies || {}
      context.cookies[name] = value
    }
    responseCookies.push({ name, value, options })
  },
  clear(name: string, domain?: string) {
    responseCookies.push({ name, value: '', options: { maxAge: 0, domain } })
  }
}

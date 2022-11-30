import cookie from 'cookie'
import { Context } from '.'

export interface Cookie {
  name: string
  value: string
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
}

export const responseCookies: Cookie[] = []

export const parseCookie = (ctx: Context) => {
  if (ctx.request.headers!.cookie) {
    ctx.cookies = cookie.parse(ctx.request.headers!.cookie) || {}
  }
  responseCookies.splice(0, responseCookies.length)
}

export const assembleCookie = (ctx: Context) => {
  ctx.response.headers['Set-Cookie'] = responseCookies.map((rc) => cookie.serialize(rc.name, rc.value, rc))
}

export const setCookie = (cookie: Cookie) => {
  responseCookies.push(cookie)
}

export const clearCookie = (name: string) => {
  setCookie({ name, value: '', maxAge: 0 })
}

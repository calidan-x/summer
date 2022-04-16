interface Cookie {
  name: string
  value: string
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
}

export const responseCookies: Cookie[] = []

export const setCookie = (cookie: Cookie) => {
  responseCookies.push(cookie)
}

export const clearCookie = (name: string) => {
  setCookie({ name, value: '', maxAge: 0 })
}

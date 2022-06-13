import cookie from 'cookie'
import crypto from 'crypto'

import { Context } from '.'
import { Cookie, setCookie } from './cookie'
import { Logger } from './logger'

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export interface SessionConfig {
  expireIn: number
  cookieName?: string
}

const SESSIONS = {}
const SESSION_IDS = []
export const session = {
  enabled: false,
  cookieName: 'SUMMER_SESSION',
  expireIn: 0,
  init(config: SessionConfig) {
    this.enabled = true
    if (config.cookieName) {
      this.cookieName = config.cookieName
    }
    const SixHours = 6 * 60 * 60 * 1000
    if (config.expireIn > SixHours) {
      Logger.warning('Session expire time cannot bigger than 6 hours, set to 6 hours')
      config.expireIn = SixHours
    }
    this.expireIn = config.expireIn
  },
  handleSession(ctx: Context) {
    if (!this.enabled) {
      return
    }

    let sessionValues: Record<string, any> = {}

    while (true) {
      if (SESSION_IDS.length === 0) {
        break
      }
      const sId = SESSION_IDS[0]
      if (SESSIONS[sId]._expireIn < Date.now()) {
        SESSION_IDS.splice(0, 1)
        delete SESSIONS[sId]
      } else {
        break
      }
    }

    let sessionId = ctx.cookies[this.cookieName]
    if (sessionId && SESSIONS[sessionId]) {
      sessionValues = SESSIONS[sessionId]
    } else {
      sessionId = md5(Date.now() + '' + Math.random())
      SESSIONS[sessionId] = sessionValues
      SESSION_IDS.push(sessionId)
    }

    const expireDate = new Date()
    expireDate.setTime(new Date().getTime() + this.expireIn * 1000)
    const sessionCookie: Cookie = { name: this.cookieName, value: sessionId, httpOnly: true }
    sessionValues._expireIn = expireDate.getTime()
    setCookie(sessionCookie)
  }
}

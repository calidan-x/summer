import crypto from 'crypto'

import { Context, getContext } from '.'
import { Cookie } from './cookie'
import { Logger } from './logger'
import { SerializeOptions } from 'cookie'

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export interface SessionConfig {
  expireIn: number
  mode?: 'Cookie' | 'Header'
  sessionName?: string
  cookieOptions?: SerializeOptions
}

const SESSIONS = {}
export const expireTimers: Record<string, NodeJS.Timeout> = {}
export const session = {
  enabled: false,
  sessionName: 'SUMMER_SESSION',
  expireIn: 0,
  mode: 'Cookie' as 'Cookie' | 'Header',
  cookieOptions: { httpOnly: true },
  init(config: SessionConfig) {
    this.enabled = true
    if (config.sessionName) {
      this.sessionName = config.sessionName
    }
    if (config.mode) {
      this.mode = config.mode
    }
    const SixHours = 6 * 60 * 60 * 1000
    if (config.expireIn > SixHours) {
      Logger.warn('Session expire time cannot greater than 6 hours, set to 6 hours')
      config.expireIn = SixHours
    }
    this.expireIn = config.expireIn
    if (config.cookieOptions) {
      this.cookieOptions = config.cookieOptions
    }
  },
  getSessionId() {
    const context = getContext()
    let sessionId: string | undefined
    if (context) {
      if (session.mode === 'Cookie') {
        sessionId = context.cookies ? context.cookies[this.sessionName] : undefined
      } else if (session.mode === 'Header') {
        sessionId = context.request.headers[this.sessionName] || (context.response.headers[this.sessionName] as string)
      }
      if (!sessionId) {
        sessionId = md5(Date.now() + '' + Math.random())
      }
    }
    return sessionId
  },
  async handleSession(context: Context) {
    if (!this.enabled) {
      return
    }
    let sessionId = this.getSessionId()
    if (session.mode === 'Cookie') {
      Cookie.set(this.sessionName, sessionId, this.cookieOptions)
    } else if (session.mode === 'Header') {
      context.response.headers[this.sessionName] = sessionId
    }
    await this.storage.expire(sessionId, this.expireIn)
  },
  storage: {
    save: (sessionId: string, key: string, value: any) => {
      if (!SESSIONS[sessionId]) {
        SESSIONS[sessionId] = {}
      }
      SESSIONS[sessionId][key] = value
    },
    load: (sessionId: string) => {
      return SESSIONS[sessionId] || {}
    },
    clear: (sessionId: string) => {
      delete SESSIONS[sessionId]
    },
    expire: (sessionId: string, expireIn: number) => {
      if (expireTimers[sessionId]) {
        clearTimeout(expireTimers[sessionId])
      }
      expireTimers[sessionId] = setTimeout(() => {
        delete expireTimers[sessionId]
        delete SESSIONS[sessionId]
      }, expireIn * 1000)
    }
  }
}

export const Session = {
  async get(key: string) {
    const context = getContext()
    if (context) {
      let sessionId = session.getSessionId()
      if (sessionId) {
        const sessionData = (await session.storage.load(sessionId)) || {}
        return sessionData[key]
      }
    }
    return undefined
  },
  async set(key: string, value: any) {
    const context = getContext()
    if (context) {
      let sessionId = session.getSessionId()
      if (sessionId) {
        await session.storage.save(sessionId, key, value)
      }
    }
  },
  async clear() {
    const context = getContext()
    if (context) {
      let sessionId = session.getSessionId()
      if (sessionId) {
        await session.storage.clear(sessionId)
      }
    }
  },
  async getAll() {
    const context = getContext()
    if (context) {
      let sessionId = session.getSessionId()
      if (sessionId) {
        return await session.storage.load(sessionId)
      }
    }
    return undefined
  },
  setStorage(storage: {
    save: (sessionId: string, key: string, value: any) => void
    load: (sessionId: string) => any
    clear: (sessionId: string) => any
    expire: (sessionId: string, expireIn: number) => void
  }) {
    session.storage = storage
  }
}

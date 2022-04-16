import cookie from 'cookie'
import crypto from 'crypto'
import { Logger } from './logger'

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

export interface SessionConfig {
  expireIn: number
  sessionName?: string
}

const SESSIONS = {}
const SESSION_IDS = []
export const session = {
  sessionName: 'SUMMER_SESSION',
  expireIn: 0,
  init(config: SessionConfig) {
    if (config.sessionName) {
      this.sessionName = config.sessionName
    }
    const SixHours = 6 * 60 * 60 * 1000
    if (config.expireIn > SixHours) {
      Logger.warning('Session expire time cannot bigger than 6 hours, set to 6 hours')
      config.expireIn = SixHours
    }
    this.expireIn = config.expireIn
  },
  getSession(sessionId: string) {
    let sessionValues: Record<string, any> = {}
    let setCookie = ''

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

    if (sessionId && SESSIONS[sessionId]) {
      sessionValues = SESSIONS[sessionId]
    } else {
      sessionId = md5(Date.now() + '' + Math.random())
      SESSIONS[sessionId] = sessionValues
      SESSION_IDS.push(sessionId)
    }

    const expireDate = new Date()
    expireDate.setTime(new Date().getTime() + this.expireIn * 1000)
    setCookie = cookie.serialize(this.sessionName, sessionId, {
      httpOnly: true
    })
    sessionValues._expireIn = expireDate.getTime()

    return { setCookie, sessionValues }
  }
}

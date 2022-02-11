import cookie from 'cookie';
import md5 from 'md5';
import { Logger } from './logger';

export interface SessionConfig {
  expireIn: number;
  sessionName?: string;
}

const SESSIONS = {};
const SESSION_IDS = [];
export const session = {
  sessionName: 'SUMMER_SESSION',
  expireIn: 0,
  init(config: SessionConfig) {
    if (config.sessionName) {
      this.sessionName = config.sessionName;
    }
    const SixHours = 6 * 60 * 60 * 1000;
    if (config.expireIn > SixHours) {
      Logger.warning('Session expire time cannot bigger than 6 hours, set to 6 hours');
      config.expireIn = SixHours;
    }
    this.expireIn = config.expireIn;
  },
  getSession(sessionId: string) {
    let sessionValues: Record<string, any> = {};
    let setCookie = '';

    while (true) {
      if (SESSION_IDS.length === 0) {
        break;
      }
      const sId = SESSION_IDS[0];
      if (SESSIONS[sId]._expireIn < new Date().getTime()) {
        SESSION_IDS.splice(0, 1);
        delete SESSIONS[sId];
      } else {
        break;
      }
    }

    if (sessionId && SESSIONS[sessionId]) {
      sessionValues = SESSIONS[sessionId];
    } else {
      sessionId = md5(new Date().getTime() + Math.random());
      const expireDate = new Date();
      expireDate.setTime(new Date().getTime() + this.expireIn);
      setCookie = cookie.serialize(this.sessionName, sessionId, {
        httpOnly: true
      });

      sessionValues._expireIn = expireDate.getTime();
      SESSIONS[sessionId] = sessionValues;
      SESSION_IDS.push(sessionId);
    }

    return { setCookie, sessionValues };
  }
};

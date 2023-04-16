import { Controller, Get, Session } from '@summer-js/summer'
import { RedisClient } from '@summer-js/redis'

@Controller('/redis-session')
export class RedisSessionController {
  redisClient: RedisClient

  // @PostConstruct
  // init() {
  //   Session.setStorage({
  //     save: async (sessionId, key, value) => {
  //       const sessionData = JSON.parse((await this.redisClient.get(sessionId)) || '{}')
  //       sessionData[key] = value
  //       await this.redisClient.set(sessionId, JSON.stringify(sessionData))
  //     },
  //     load: async (sessionId) => {
  //       const sessionData = await this.redisClient.get(sessionId)
  //       if (sessionData) {
  //         return JSON.parse(sessionData)
  //       }
  //       return {}
  //     },
  //     clear: async (sessionId) => {
  //       await this.redisClient.del(sessionId)
  //     },
  //     expire: async (sessionId, expireIn) => {
  //       await this.redisClient.expire(sessionId, expireIn)
  //     }
  //   })
  // }

  @Get('/set-session')
  async setSession() {
    await Session.set('id', 1)
  }

  @Get('/get-session')
  async getSession() {
    return await Session.get('id')
  }
}

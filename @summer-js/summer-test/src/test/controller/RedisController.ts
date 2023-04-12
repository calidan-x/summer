import { Controller, Get, Session } from '@summer-js/summer'
import { RedisClient } from '@summer-js/redis'

@Controller('/redis')
export class RedisController {
  redisClient: RedisClient

  @Get('/test')
  async test() {
    this.redisClient.set('key', 'value')
  }

  // @PostConstruct
  // init() {
  //   Session.setStorage({
  //     save: async (sessionId, obj) => {
  //       await this.redisClient.set(sessionId, JSON.stringify(obj))
  //     },
  //     load: async (sessionId) => {
  //       const sessionData = await this.redisClient.get(sessionId)
  //       if (sessionData) {
  //         return JSON.parse(sessionData)
  //       }
  //       return {}
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

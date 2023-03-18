import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import IORedis, { RedisOptions } from 'ioredis'

let redisClient: IORedis

export type RedisConfig = RedisOptions | string

class Redis extends SummerPlugin {
  configKey = 'REDIS_CONFIG'

  async init(config) {
    if (config) {
      await this.connect(config)
    }
  }

  async connect(options: RedisOptions) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined
    redisClient = new IORedis(options)
    await new Promise((resolve) => {
      redisClient.on('connect', () => {
        if (!isSummerTesting) {
          Logger.info('Redis Connected')
        }
        resolve('')
      })
      redisClient.on('error', (message) => {
        Logger.error(message)
        resolve('')
      })
    })
  }

  async destroy() {
    if (redisClient) {
      try {
        redisClient.disconnect()
      } catch (e) {}
    }
  }
}

addPlugin(Redis)
export default Redis

// @ts-ignore
export class RedisClient extends IORedis {}
addInjectable(RedisClient, () => {
  return redisClient
})

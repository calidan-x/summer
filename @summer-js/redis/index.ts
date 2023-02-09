import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import IORedis, { RedisOptions } from 'ioredis'

let redisClient: IORedis

export type RedisConfig = RedisOptions

class Redis extends SummerPlugin {
  configKey = 'REDIS_CONFIG'

  async init(config) {
    if (config) {
      await this.connect(config)
    }
  }

  async connect(options: any) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined
    redisClient = new IORedis(options)
    if (!isSummerTesting) {
      Logger.info('Redis Connected')
    }
  }

  async destroy() {}
}

addPlugin(Redis)
export default Redis

// @ts-ignore
export class RedisClient extends IORedis {}
addInjectable(RedisClient, () => {
  return redisClient
})

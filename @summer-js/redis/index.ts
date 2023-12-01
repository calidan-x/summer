import { Logger, SummerPlugin, addPlugin, addInjectable } from '@summer-js/summer'
import IORedis, { RedisOptions } from 'ioredis'

export type RedisConfig = RedisOptions | string
// @ts-ignore
export class RedisClient<ClientKey = 'default'> extends IORedis {}

class Redis extends SummerPlugin {
  configKey = 'REDIS_CONFIG'
  config: RedisOptions
  redisClients: Record<string, IORedis> = {}

  async init(_config) {
    if (_config) {
      this.config = _config
    }
    addInjectable(RedisClient, async (key = 'default') => {
      return await this.connectAndGetInstance(key)
    })
  }

  async connectAndGetInstance(key: string) {
    if (this.config) {
      const isSummerTesting = process.env.SUMMER_TESTING !== undefined
      let redisClient = this.redisClients[key]
      if (!redisClient) {
        redisClient = new IORedis(this.config)
        this.redisClients[key] = redisClient
        await new Promise((resolve) => {
          redisClient.on('connect', () => {
            if (!isSummerTesting) {
              Logger.info(`Redis Client<${key}> Connected `)
            }
            resolve('')
          })
          redisClient.on('error', (message) => {
            Logger.error(message)
            resolve('')
          })
        })
      }
      return redisClient
    }
    return null
  }

  async destroy() {
    try {
      for (const redisClient of Object.values(this.redisClients)) {
        redisClient.disconnect()
      }
    } catch (e) {}
  }
}

addPlugin(Redis)
export default Redis

/*
interface LockOptions {
  maxLockTime?: number
  maxRetryTimes?: number
  retryDelay?: number
  lockKey?: string | ((...params: any) => string)
  onError?: (error: TooManyExecutionsError | ExecuteTimeoutError) => void
}

export class TooManyExecutionsError extends Error {}
export class ExecuteTimeoutError extends Error {}

export const distributedLock = async (
  executeMode: 'ExecuteOnce' | 'ExecuteOneByOne',
  lockKey: string,
  invokeMethod: () => any,
  lockOptions?: Omit<LockOptions, 'lockKey' | 'onError'>
) => {
  let key = lockKey
  if (executeMode === 'ExecuteOnce') {
    let maxLockTime = lockOptions?.maxLockTime || 5000
    maxLockTime = maxLockTime / 1000
    const result = await redisClient.setnx(key, 1)
    if (result === 1) {
      await redisClient.expire(key, maxLockTime)
      return await invokeMethod()
    }
  } else if (executeMode === 'ExecuteOneByOne') {
    let maxLockTime = lockOptions?.maxLockTime || 5000

    const maxRetryTimes = lockOptions?.maxRetryTimes || 10
    const retryDelay = lockOptions?.retryDelay || 200
    const timeout = setTimeout(() => {
      redisClient.del(key)
      throw new ExecuteTimeoutError('Error: Execute timeout')
    }, maxLockTime)

    for (let i = 0; i < maxRetryTimes; i++) {
      const result = await redisClient.setnx(key, 1)
      if (result === 1) {
        try {
          clearTimeout(timeout)
          const result = await invokeMethod()
          await redisClient.del(key)
          return result
        } catch (e) {
          await redisClient.del(key)
          throw e
        }
      }
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelay)
      })
    }
    clearTimeout(timeout)
    throw new TooManyExecutionsError('Error: Too many executions')
  }
}

export const DistributedLock = createMethodDecorator(
  async (ctx, invokeMethod, executeMode: 'ExecuteOnce' | 'ExecuteOneByOne', lockOptions?: LockOptions) => {
    let key = ctx.invocation.className + '-' + ctx.invocation.methodName
    if (lockOptions?.lockKey) {
      key =
        typeof lockOptions?.lockKey === 'function'
          ? lockOptions?.lockKey.apply(null, ctx.invocation.params)
          : lockOptions?.lockKey
    }
    try {
      return distributedLock(executeMode, key, async () => await invokeMethod(ctx.invocation.params), lockOptions)
    } catch (err) {
      if (lockOptions?.onError) {
        lockOptions?.onError(err)
      } else {
        throw err
      }
    }
  }
)
*/

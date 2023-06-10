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

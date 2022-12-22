import { summerStart, handler, Logger, createPropertyDecorator } from '@summer-js/summer'
import { getDataSource } from '@summer-js/typeorm'
import { createClient } from 'redis'

export { handler }

export const HttpClient = createPropertyDecorator(() => {
  return createClient({ url: 'redis://alice:foobared@awesome.redis.server:6380' })
})

const runMigrations = async () => {
  const output = await getDataSource('DATA_SOURCE').runMigrations()
  output.forEach((m) => {
    Logger.info('Run migration: ' + m.name)
  })
}

summerStart({
  async before() {
    if (process.env.SUMMER_ENV !== 'prod') {
      await runMigrations()
    }
  },
  after() {}
})

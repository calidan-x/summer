import { summerStart, handler, Logger, addInjectable, getConfig } from '@summer-js/summer'
import { Repository } from 'typeorm'
import { getDataSource } from '@summer-js/typeorm'
export { handler }



const runMigrations = async () => {
  const output = await getDataSource('DATA_SOURCE').runMigrations()
  output.forEach((m) => {
    Logger.info('Run migration: ' + m.name)
  })
}

summerStart({
  async before(config) {
    if (process.env.SUMMER_ENV !== 'prod') {
      await runMigrations()
    }
  },
  after(config) {}
})

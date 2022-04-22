import { getDataSource } from '@summer-js/typeorm'
import { summerStart, handler, Logger } from '@summer-js/summer'
import './auto-imports'
export { handler }

const runMigrations = async () => {
  const output = await getDataSource('DATA_SOURCE').runMigrations()
  output.forEach((m) => {
    Logger.info('Run migration: ' + m.name)
  })
}

summerStart({
  async before(config) {
    await runMigrations()
  },
  after(config) {}
})

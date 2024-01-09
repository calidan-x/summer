import { summerStart, handler, Logger, replaceEnvConfigValue } from '@summer-js/summer'
import { getDataSource } from '@summer-js/typeorm'

export { handler }

const runMigrations = async () => {
  const output = await getDataSource('DATA_SOURCE').runMigrations()
  output.forEach((m) => {
    Logger.info('Run migration: ' + m.name)
  })
}

summerStart({
  async init() {
    replaceEnvConfigValue((value) => {
      return value
    })
  },
  async before() {
    if (SUMMER_ENV !== 'prod') {
      await runMigrations()
    }
  },
  after() {}
})

// traceRequest((info) => {
//   console.log('-----')
//   console.log(info.context)
// })

// codeCheck({
//   controller() {},
//   api() {}
// })

// 检查文件存放位置
// 检查API命名
// 检查类命名

import { Logger } from '@summer-js/summer'
import { initTest, endTest } from '@summer-js/test'

describe('Test Logger', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should log all', async () => {
    jest.spyOn(console, 'log')
    Logger.logType = 'All'
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    expect((console.log as any).mock.calls.length).toBe(4)
    jest.clearAllMocks()
  })

  test('should log noting', async () => {
    jest.spyOn(console, 'log')
    Logger.logType = 'None'
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    expect((console.log as any).mock.calls.length).toBe(0)
    jest.clearAllMocks()
  })

  test('should log error', async () => {
    jest.spyOn(console, 'log')
    Logger.logType = 'OnlyError'
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    expect((console.log as any).mock.calls.length).toBe(1)
    jest.clearAllMocks()
  })
})

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
    Logger.logType = ['Info', 'Warning', 'Log', 'Error', 'Debug']
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(5)
    jest.clearAllMocks()
  })

  test('should log noting', async () => {
    jest.spyOn(console, 'log')
    Logger.logType = []
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(0)
    jest.clearAllMocks()
  })

  test('should log error', async () => {
    jest.spyOn(console, 'log')
    Logger.logType = ['Error']
    Logger.log('')
    Logger.warning('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(1)
    jest.clearAllMocks()
  })
})

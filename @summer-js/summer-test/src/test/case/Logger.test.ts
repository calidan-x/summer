import { Logger } from '@summer-js/summer'
import '@summer-js/test'

describe('Test Logger', () => {
  test('should log all', async () => {
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
    jest.spyOn(console, 'info')
    jest.spyOn(console, 'debug')
    jest.spyOn(console, 'error')
    Logger.logEnableTypes = ['Info', 'Warn', 'Log', 'Error', 'Debug']
    Logger.log('')
    Logger.warn('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(1)
    expect((console.warn as any).mock.calls.length).toBe(1)
    expect((console.info as any).mock.calls.length).toBe(1)
    expect((console.debug as any).mock.calls.length).toBe(1)
    expect((console.error as any).mock.calls.length).toBe(1)
    jest.clearAllMocks()
  })

  test('should log noting', async () => {
    jest.spyOn(console, 'log')
    Logger.logEnableTypes = []
    Logger.log('')
    Logger.warn('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(0)
    jest.clearAllMocks()
  })

  test('should log error', async () => {
    jest.spyOn(console, 'log')
    Logger.logEnableTypes = ['Error']
    Logger.log('')
    Logger.warn('')
    Logger.info('')
    Logger.error('')
    Logger.debug('')
    expect((console.log as any).mock.calls.length).toBe(0)
    expect((console.error as any).mock.calls.length).toBe(1)
    jest.clearAllMocks()
  })
})

import { Logger } from '@summer-js/summer'
import '@summer-js/test'

beforeAll(() => {
  const log = (...args) => {
    process.stdout.write(args.join(' ') + '\n')
  }
  console.log = log
  console.warn = log
  console.info = log
  console.debug = log
  console.error = log
})

describe('Test Logger', () => {
  test('should log all', async () => {
    jest.spyOn(console, 'log')
    jest.spyOn(console, 'warn')
    jest.spyOn(console, 'info')
    jest.spyOn(console, 'debug')
    jest.spyOn(console, 'error')
    Logger.enableTypes = ['Info', 'Warn', 'Log', 'Error', 'Debug']
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
    Logger.enableTypes = []
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
    Logger.enableTypes = ['Error']
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

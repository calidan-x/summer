const addZero = (num: number) => (num < 10 ? '0' + num : num + '')

const timePrefix = () => {
  const now = new Date()
  const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate())
  const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds())
  return `[${date} ${time}]`
}

type LogType = ('Log' | 'Warning' | 'Error' | 'Info' | 'Debug')[]
const sLogType = Symbol('LogEnable')
const isTerminal = process.env.TERM !== undefined
export const Logger = {
  [sLogType]: ['Log', 'Warning', 'Error', 'Info', 'Debug'],
  get logType() {
    return this.EnableType
  },
  set logType(enable: LogType) {
    this[sLogType] = enable
  },
  info(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Info')) {
      console.log(isTerminal ? '\x1b[32m%s\x1b[0m' : '%s', timePrefix() + '[INFO] ' + message, ...optionalParams)
    }
  },
  error(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Error')) {
      console.log(isTerminal ? '\x1b[31m%s\x1b[0m' : '%s', timePrefix() + '[ERROR] ' + message, ...optionalParams)
    }
  },
  warning(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Warning')) {
      console.log(isTerminal ? '\x1b[33m%s\x1b[0m' : '%s', timePrefix() + '[WARNING] ' + message, ...optionalParams)
    }
  },
  log(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Log')) {
      console.log(timePrefix() + '[LOG] ' + message, ...optionalParams)
    }
  },
  debug(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Debug')) {
      console.log(isTerminal ? '\x1b[36m%s\x1b[0m' : '%s', timePrefix() + '[DEBUG] ' + message, ...optionalParams)
    }
  }
}

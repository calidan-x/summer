const addZero = (num: number) => (num < 10 ? '0' + num : num + '')

const timePrefix = () => {
  const now = new Date()
  if (timeOffset) {
    now.setMinutes(now.getMinutes() + timeOffset)
  }
  const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate())
  const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds())
  return `[${date} ${time}]`
}

type LogType = ('Log' | 'Warn' | 'Error' | 'Info' | 'Debug')[]
const sLogType = Symbol('LogEnable')
const isTerminal = process.env.TERM !== undefined
const print = (color: string, type: string, method: string, message?: any, ...optionalParams: any[]) => {
  if (!isTerminal) {
    console[method](timePrefix(), type, message, ...optionalParams)
  } else {
    console[method](`\x1b[${color}${timePrefix()}`, type, message, ...optionalParams, '\x1b[0m')
  }
}

let timeOffset = 0
export const Logger = {
  [sLogType]: ['Log', 'Warn', 'Error', 'Info', 'Debug'],
  get enableTypes() {
    return this.EnableType
  },
  set enableTypes(enable: LogType) {
    this[sLogType] = enable
  },
  setTimeZone(timeZone: number) {
    timeOffset = timeZone * 60 + new Date().getTimezoneOffset()
  },
  info(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Info')) {
      print('32m', '[INFO]', 'info', message, ...optionalParams)
    }
  },
  error(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Error')) {
      print('31m', '[ERROR]', 'error', message, ...optionalParams)
    }
  },
  warn(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Warn')) {
      print('33m', '[WARN]', 'warn', message, ...optionalParams)
    }
  },
  log(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Log')) {
      console.log(timePrefix(), '[LOG]', message, ...optionalParams)
    }
  },
  debug(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Debug')) {
      print('36m', '[DEBUG]', 'debug', message, ...optionalParams)
    }
  }
}

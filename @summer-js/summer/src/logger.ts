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
const print = (color: string, type: string, message?: any, ...optionalParams: any[]) => {
  if (!isTerminal) {
    console.log(timePrefix(), type, message, ...optionalParams)
  } else {
    console.log(`\x1b[${color}${timePrefix()}`, type, message, ...optionalParams, '\x1b[0m')
  }
}

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
      print('32m', '[INFO]', message, ...optionalParams)
    }
  },
  error(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Error')) {
      print('31m', '[ERROR]', message, ...optionalParams)
    }
  },
  warning(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Warning')) {
      print('33m', '[WARNING]', message, ...optionalParams)
    }
  },
  log(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Log')) {
      console.log(timePrefix(), '[LOG]', message, ...optionalParams)
    }
  },
  debug(message?: any, ...optionalParams: any[]) {
    if (this[sLogType].includes('Debug')) {
      print('36m', '[DEBUG]', message, ...optionalParams)
    }
  }
}

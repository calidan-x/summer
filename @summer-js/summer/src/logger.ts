const addZero = (num: number) => (num < 10 ? '0' + num : num + '')

const timePrefix = () => {
  const now = new Date()
  const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate())
  const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds())
  return `[${date} ${time}]`
}

type LogType = ('Log' | 'Warning' | 'Error' | 'Info' | 'Debug')[]
const sLogType = Symbol('LogEnable')
export const Logger = {
  [sLogType]: ['Log', 'Warning', 'Error', 'Info', 'Debug'],
  get logType() {
    return this.EnableType
  },
  set logType(enable: LogType) {
    this[sLogType] = enable
  },
  info(str: string) {
    if (this[sLogType].includes('Info')) {
      console.log('\x1b[32m%s\x1b[0m', timePrefix() + '[INFO] ' + str)
    }
  },
  error(str: string) {
    if (this[sLogType].includes('Error')) {
      console.log('\x1b[31m%s\x1b[0m', timePrefix() + '[ERROR] ' + str)
    }
  },
  warning(str: string) {
    if (this[sLogType].includes('Warning')) {
      console.log('\x1b[33m%s\x1b[0m', timePrefix() + '[WARNING] ' + str)
    }
  },
  log(str: string) {
    if (this[sLogType].includes('Log')) {
      console.log(timePrefix() + '[LOG] ' + str)
    }
  },
  debug(str: string) {
    if (this[sLogType].includes('Debug')) {
      console.log('\x1b[36m%s\x1b[0m', timePrefix() + '[Debug] ' + str)
    }
  }
}

const addZero = (num: number) => {
  if (num < 10) {
    return '0' + num
  }
  return num + ''
}

const timePrefix = () => {
  const now = new Date()
  const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate())
  const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds())
  return `[${date} ${time}]`
}

type LogType = 'All' | 'OnlyError' | 'None'
const sLogType = Symbol('LogEnable')
export const Logger = {
  [sLogType]: 'All',
  get logType() {
    return this.EnableType
  },
  set logType(enable: LogType) {
    this[sLogType] = enable
  },
  info(str: string) {
    if (this[sLogType] === 'All') {
      console.log('\x1b[32m%s\x1b[0m', timePrefix() + '[INFO] ' + str)
    }
  },
  error(str: string) {
    if (this[sLogType] === 'All' || this[sLogType] === 'OnlyError') {
      console.log('\x1b[31m%s\x1b[0m', timePrefix() + '[ERROR] ' + str)
    }
  },
  warning(str: string) {
    if (this[sLogType] === 'All') {
      console.log('\x1b[33m%s\x1b[0m', timePrefix() + '[WARNING] ' + str)
    }
  },
  log(str: string) {
    if (this[sLogType] === 'All') {
      console.log(timePrefix() + '[LOG] ' + str)
    }
  }
}

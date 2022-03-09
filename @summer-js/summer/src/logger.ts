const addZero = (num: number) => {
  if (num < 10) {
    return '0' + num;
  }
  return num + '';
};

export const Logger = {
  get timePrefix() {
    const now = new Date();
    const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate());
    const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds());
    return `[${date} ${time}]`;
  },
  info(str: string) {
    console.info('\x1b[36m%s\x1b[0m', this.timePrefix + '[INFO] ' + str);
  },
  error(str: string) {
    console.error('\x1b[31m%s\x1b[0m', this.timePrefix + '[ERROR] ' + str);
  },
  warning(str: string) {
    console.warn('\x1b[33m%s\x1b[0m', this.timePrefix + '[WARNING] ' + str);
  },
  log(str: string) {
    console.info(this.timePrefix + ' ' + str);
  }
};

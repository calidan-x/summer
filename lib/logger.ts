const addZero = (num: number) => {
  if (num < 10) {
    return '0' + num;
  }
  return num + '';
};
export const log = (str: string) => {
  const now = new Date();
  const date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate());
  const time = addZero(now.getHours()) + ':' + addZero(now.getMinutes()) + ':' + addZero(now.getSeconds());
  console.log(`[${date} ${time}] ${str}`);
};

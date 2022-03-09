export const fillData = <T>(
  instance: T,
  fillData: Partial<T> & Omit<Record<string, any>, keyof T>,
  options: { allowExtendData: boolean } = { allowExtendData: false }
): T => {
  for (const k in fillData) {
    let propType = Reflect.getMetadata('design:type', instance, k);
    if (propType || options.allowExtendData) {
      instance[k] = fillData[k];
    }
  }
  return instance;
};

interface Type<T> extends Function {
  new (...args: any[]): T;
}

export const convertData = <T>(
  data: Partial<T> & Omit<Record<string, any>, keyof T>,
  clazz: Type<T>,
  options: { allowExtendData: boolean } = { allowExtendData: false }
): T => {
  const instance = new clazz();
  for (const k in data) {
    let propType = Reflect.getMetadata('design:type', instance, k);
    if (propType || options.allowExtendData) {
      instance[k] = data[k];
    }
  }
  return instance;
};

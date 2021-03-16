export const convertClass = (object: any, clazz: any) => {
  let outInstance = new (clazz as any)();
  for (const k in object) {
    if (outInstance.hasOwnProperty(k)) {
      outInstance[k] = object[k];
    }
  }
  return outInstance;
};

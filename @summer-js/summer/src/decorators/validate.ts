const defineMetaValue = (arg, validateKey, validateValue) => {
  const target = arg[0];
  const property = arg[1];
  const index = arg[2];
  if (index === undefined) {
    Reflect.defineMetadata(validateKey, validateValue, target, property);
  }
  // param
  else if (arg.length === 3) {
    const paramMaxValues = Reflect.getOwnMetadata(validateKey, target, property) || [];
    paramMaxValues[index] = validateValue;
    Reflect.defineMetadata(validateKey, paramMaxValues, target, property);
  }
};

export const Max =
  (max: number) =>
  (...arg) =>
    defineMetaValue(arg, 'max', max);

export const Min =
  (min: number) =>
  (...arg) =>
    defineMetaValue(arg, 'min', min);

export const MaxLength =
  (maxLength: number) =>
  (...arg) =>
    defineMetaValue(arg, 'maxLength', maxLength);

export const MinLength =
  (minLength: number) =>
  (...arg) =>
    defineMetaValue(arg, 'minLength', minLength);

export const Required =
  () =>
  (...arg) =>
    defineMetaValue(arg, 'required', true);

export const Match =
  (regExp: RegExp) =>
  (...arg) =>
    defineMetaValue(arg, 'match', regExp);

export const Email =
  () =>
  (...arg) =>
    defineMetaValue(arg, 'email', true);

const defineMetaValue = (arg, validateKey, validateValue) => {
  const target = arg[0]
  const property = arg[1]
  const index = arg[2]
  if (index === undefined) {
    Reflect.defineMetadata(validateKey, validateValue, target, property)
  }
  // param
  else if (arg.length === 3) {
    const paramMaxValues = Reflect.getOwnMetadata(validateKey, target, property) || []
    paramMaxValues[index] = validateValue
    Reflect.defineMetadata(validateKey, paramMaxValues, target, property)
  }
}

interface ValidateDecoratorType {
  (): PropertyDecorator
  (target: any, propertyKey: string): void
}

export const Max =
  (max: number) =>
  (...arg) =>
    defineMetaValue(arg, 'max', max)

export const Min =
  (min: number) =>
  (...arg) =>
    defineMetaValue(arg, 'min', min)

export const MaxLen =
  (maxLength: number) =>
  (...arg) =>
    defineMetaValue(arg, 'maxLen', maxLength)

export const MinLen =
  (minLength: number) =>
  (...arg) =>
    defineMetaValue(arg, 'minLen', minLength)

const Required: ValidateDecoratorType = (...args) => {
  if (args.length === 0) {
    return (...arg) => defineMetaValue(arg, 'required', true)
  } else {
    defineMetaValue(args, 'required', true)
  }
}
;(global as any)._Required = Required

export const Pattern =
  (regExp: RegExp) =>
  (...arg) =>
    defineMetaValue(arg, 'pattern', regExp)

export const Email: ValidateDecoratorType = (...args) => {
  if (args.length === 0) {
    return (...arg) => defineMetaValue(arg, 'email', true)
  } else {
    defineMetaValue(args, 'email', true)
  }
}

export const Validate =
  (validateFunction: (value: any) => boolean) =>
  (...arg) =>
    defineMetaValue(arg, 'validate', validateFunction)

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

export type ValidateMessage = string | ((value?: any) => string)

interface ValidateDecoratorType {
  (validateMessage?: ValidateMessage): PropertyDecorator
  (target: any, propertyKey: string): void
}

export const Max =
  (max: number, validateMessage?: ValidateMessage) =>
  (...arg) => {
    defineMetaValue(arg, 'max', max)
    if (validateMessage) {
      defineMetaValue(arg, 'message[max]', validateMessage)
    }
  }

export const Min =
  (min: number, validateMessage?: ValidateMessage) =>
  (...arg) => {
    defineMetaValue(arg, 'min', min)
    if (validateMessage) {
      defineMetaValue(arg, 'message[min]', validateMessage)
    }
  }

export function Len(length: number, validateMessage?: ValidateMessage): PropertyDecorator
export function Len(minLength: number, maxLength: number, validateMessage?: ValidateMessage): PropertyDecorator
export function Len(...args) {
  return (...arg) => {
    if (args.length === 1 || (args.length === 2 && typeof args[1] !== 'number')) {
      defineMetaValue(arg, 'len', args[0])
      if (args[1]) {
        defineMetaValue(arg, 'message[len]', args[1])
      }
    } else {
      defineMetaValue(arg, 'lenRange', [args[0], args[1]])
      if (args[2]) {
        defineMetaValue(arg, 'message[lenRange]', args[2])
      }
    }
  }
}

export const MaxLen =
  (maxLength: number, validateMessage?: ValidateMessage) =>
  (...arg) => {
    defineMetaValue(arg, 'maxLen', maxLength)
    if (validateMessage) {
      defineMetaValue(arg, 'message[maxLen]', validateMessage)
    }
  }

export const MinLen =
  (minLength: number, validateMessage?: ValidateMessage) =>
  (...arg) => {
    defineMetaValue(arg, 'minLen', minLength)
    if (validateMessage) {
      defineMetaValue(arg, 'message[minLen]', validateMessage)
    }
  }
// @ts-ignore
const Optional: ValidateDecoratorType = (...args) => {
  if (args.length === 0) {
    return (...arg) => defineMetaValue(arg, 'optional', true)
  } else {
    defineMetaValue(args, 'optional', true)
  }
}
;(global as any)._Optional = Optional

// @ts-ignore
const NotBlank: ValidateDecoratorType = (...args) => {
  if (args.length === 0) {
    return (...arg) => defineMetaValue(arg, 'notBlank', true)
  } else {
    defineMetaValue(args, 'notBlank', true)
  }
}
;(global as any)._NotBlank = NotBlank

export const Pattern =
  (regExp: RegExp, validateMessage?: ValidateMessage) =>
  (...arg) => {
    defineMetaValue(arg, 'pattern', regExp)
    if (validateMessage) {
      defineMetaValue(arg, 'message[pattern]', validateMessage)
    }
  }

// @ts-ignore
export const Email: ValidateDecoratorType = (...args) => {
  if (args.length <= 1) {
    return (...arg) => {
      defineMetaValue(arg, 'email', true)
      if (args[0]) {
        defineMetaValue(arg, 'message[email]', args[0])
      }
    }
  } else {
    defineMetaValue(args, 'email', true)
  }
}

export const Validate =
  (validateFunction: (value: any) => boolean | string) =>
  (...arg) =>
    defineMetaValue(arg, 'validate', validateFunction)

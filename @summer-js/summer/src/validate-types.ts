import os from 'os'
import { ValidateMessage } from './decorators'

export class File {
  filename: string
  encoding: string
  mimeType: string
  tmpPath: string
}

export interface ValidateError {
  param: string
  message: string
}

export const validateAndConvertType = (
  declareType: any[],
  propertyName: string,
  propertyValue: any,
  allErrors: ValidateError[],
  methodName = '',
  paramIndex = -1,
  instance: any = undefined,
  propertyNamePath = ''
) => {
  const isFirstLevel = paramIndex >= 0

  if (declareType === undefined) {
    return propertyValue
  }

  let [d0, d1, d2] = declareType || []

  if (typeof d0 === 'function' && d0.name === '') {
    d0 = d0()
  }

  if (d0 === undefined && d1 !== Array) {
    if (propertyValue === undefined || propertyValue === null) {
      let errorParam = propertyNamePath + (propertyNamePath && !propertyName.startsWith('[') ? '.' : '') + propertyName
      validateRequired(instance, methodName, paramIndex, propertyName, errorParam, propertyValue, allErrors)
    }
    return propertyValue
  }

  let checkType = d1 || d0

  if (Array.isArray(d0)) {
    checkType = 'Union'
  } else if (typeof d0 === 'object' && d1 !== Array) {
    let isStringEnum = true
    for (const k in d0) {
      if (typeof d0[k] === 'number') {
        isStringEnum = false
        break
      }
    }
    checkType = isStringEnum ? String : Number
  }

  let value: any = undefined
  let errorParam = propertyNamePath + (propertyNamePath && !propertyName.startsWith('[') ? '.' : '') + propertyName
  if (propertyValue === undefined || propertyValue === null) {
    validateRequired(instance, methodName, paramIndex, propertyName, errorParam, propertyValue, allErrors)
    return propertyValue
  }

  customValidate(instance, methodName, paramIndex, propertyName, errorParam, propertyValue, allErrors, isFirstLevel)

  switch (checkType) {
    case String:
      value = isFirstLevel ? propertyValue + '' : propertyValue
      if (typeof value !== 'string') {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propertyValue, isFirstLevel) + ' is not a string'
        })
        break
      }

      // string enum
      if (typeof d0 === 'object') {
        value = d0[propertyValue]
        if (value === undefined) {
          allErrors.push({
            param: errorParam,
            message:
              typeDisplayText(propertyValue, isFirstLevel) +
              ' is not in ' +
              JSON.stringify(Object.keys(d0).filter((key) => typeof d0[d0[key]] !== 'number'))
          })
        }
      }

      validateEmail(instance, methodName, paramIndex, propertyName, errorParam, propertyValue, allErrors)
      validatePattern(
        instance,
        methodName,
        paramIndex,
        propertyName,
        errorParam,
        propertyValue,
        allErrors,
        isFirstLevel
      )
      validateMinMaxLength(
        instance,
        methodName,
        paramIndex,
        propertyName,
        errorParam,
        propertyValue,
        allErrors,
        isFirstLevel
      )
      validateNotEmptyOrBlank(instance, methodName, paramIndex, propertyName, errorParam, propertyValue, allErrors)
      break
    case Number:
    case _Int:
      const numVal = Number(propertyValue)
      if (typeof propertyValue === 'boolean' || propertyValue === null) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propertyValue, isFirstLevel) + ' is not a number'
        })
      } else if (d0 === Number) {
        if (Number.isNaN(numVal) || typeof numVal !== 'number') {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propertyValue, isFirstLevel) + ' is not a number'
          })
        }
        value = numVal
      } else if (d0 === _Int || d0 === BigInt) {
        if (!Number.isInteger(numVal)) {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propertyValue, isFirstLevel) + ' is not an integer'
          })
        }
        value = numVal
      }
      // number enum
      else if (typeof d0 === 'object') {
        value = d0[propertyValue]
        if (value === undefined || typeof value === 'string') {
          allErrors.push({
            param: errorParam,
            message:
              typeDisplayText(propertyValue, isFirstLevel) +
              ' is not in ' +
              JSON.stringify(Object.keys(d0).filter((key) => typeof d0[d0[key]] !== 'number'))
          })
        }
      }
      validateMinMax(instance, methodName, paramIndex, propertyName, errorParam, value, allErrors, isFirstLevel)
      break
    case BigInt:
      try {
        const bigIntVal = BigInt(propertyValue)
        value = bigIntVal
      } catch (e) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propertyValue, isFirstLevel) + ' cannot convert to a BigInt'
        })
      }
      break
    case Date:
      if (typeof propertyValue === 'string') {
        if (/^\d{13}$/.test(propertyValue)) {
          value = new Date(parseInt(propertyValue))
        } else {
          const timeStamp = Date.parse(propertyValue)
          if (!timeStamp || isNaN(timeStamp)) {
            allErrors.push({
              param: errorParam,
              message: 'error parsing ' + typeDisplayText(propertyValue, isFirstLevel) + ' to Date'
            })
          } else {
            value = new Date(timeStamp)
          }
        }
      } else if (typeof propertyValue === 'number') {
        value = new Date(propertyValue)
      } else {
        allErrors.push({
          param: errorParam,
          message: 'error parsing ' + typeDisplayText(propertyValue, isFirstLevel) + ' to Date'
        })
      }
      break
    case Boolean:
      if (typeof propertyValue === 'boolean') {
        value = propertyValue
      } else if (typeof propertyValue === 'string') {
        if (propertyValue.toLowerCase() === 'false' || propertyValue === '0') {
          value = false
        } else if (propertyValue.toLowerCase() === 'true' || propertyValue === '1') {
          value = true
        } else {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propertyValue, isFirstLevel) + ' is not a boolean'
          })
        }
      } else if (typeof propertyValue === 'number') {
        if (propertyValue === 0) {
          value = false
        } else if (propertyValue === 1) {
          value = true
        } else {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propertyValue, isFirstLevel) + ' is not a boolean'
          })
        }
      }
      break
    case File:
      value = propertyValue
      if (propertyValue) {
        if (!propertyValue.tmpPath) {
          allErrors.push({
            param: errorParam,
            message: 'File upload failed'
          })
        } else if (!propertyValue.tmpPath.startsWith(os.tmpdir())) {
          allErrors.push({
            param: errorParam,
            message: 'File upload failed'
          })
        }
      }
      break

    case 'Union':
      value = propertyValue
      if (!d0.includes(value) && !d0.includes(value.__proto__)) {
        const types: string[] = []
        const printArr = d0.filter((d) => {
          if (d === String.prototype) {
            types.push('String')
          } else if (d === Number.prototype) {
            types.push('Number')
          } else if (d === Boolean.prototype) {
            types.push('Boolean')
          } else {
            return true
          }
          return false
        })
        allErrors.push({
          param: errorParam,
          message:
            typeDisplayText(propertyValue, isFirstLevel) +
            ' is not in ' +
            JSON.stringify(printArr) +
            (types.length ? ' or [' + types.join(',') + ']' : '')
        })
      }
      break
    case Array:
      let arrayValue: any = []
      try {
        arrayValue = typeof propertyValue === 'string' ? JSON.parse(propertyValue) : propertyValue
        if (typeof arrayValue === 'number' && typeof propertyValue === 'string') {
          arrayValue = [arrayValue]
        }
      } catch (e) {
        if ((d0 === _Int || d0 === Number) && typeof propertyValue === 'string') {
          arrayValue = propertyValue.split(',')
        } else {
          allErrors.push({
            param: errorParam,
            message:
              'error parsing ' + typeDisplayText(propertyValue, isFirstLevel) + ' to ' + (d0?.name || 'array') + '[]'
          })
          break
        }
      }

      if (!Array.isArray(arrayValue)) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propertyValue, isFirstLevel) + ' is not an array'
        })
      } else {
        validateMinMaxLength(
          instance,
          methodName,
          paramIndex,
          propertyName,
          errorParam,
          arrayValue,
          allErrors,
          isFirstLevel
        )

        let arrValueType: any = [d0, undefined, d2]
        for (let i = 0; i < arrayValue.length; i++) {
          arrayValue[i] = validateAndConvertType(
            arrValueType,
            '[' + i + ']',
            arrayValue[i],
            allErrors,
            '',
            -1,
            arrayValue,
            errorParam
          )
        }
        value = arrayValue
      }
      break
    default:
      if (typeof d0 === 'string') {
        if (propertyValue !== d0) {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propertyValue, isFirstLevel) + " is not equals '" + d0 + "'"
          })
        } else {
          value = propertyValue
        }
        break
      }

      let classInstance = new d0()
      let objectValue = {}

      try {
        objectValue = typeof propertyValue === 'string' ? JSON.parse(propertyValue) : propertyValue
      } catch (e) {
        allErrors.push({
          param: errorParam,
          message: 'error parsing ' + typeDisplayText(propertyValue, isFirstLevel) + ' to ' + (d0?.name || 'object')
        })
        break
      }

      if (Array.isArray(objectValue)) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propertyValue, isFirstLevel) + ' is not an object'
        })
      } else {
        const allProperties: string[] = []
        let proto = d0
        while (proto.name) {
          allProperties.push(...Reflect.getOwnMetadataKeys(proto.prototype))
          proto = proto.__proto__
        }

        for (const k of Object.keys(objectValue)) {
          if (!allProperties.includes(k)) {
            delete objectValue[k]
          }
        }

        for (const k of allProperties) {
          let declareType = Reflect.getMetadata('DeclareType', d0.prototype, k) || []

          if (declareType[0] === undefined) {
            classInstance[k] = objectValue[k]
            continue
          }

          if (typeof declareType[0] === 'number') {
            const d1Type = declareType[1]
            declareType = d2[declareType[0]]
            if (d1Type) {
              declareType[1] = d1Type
            }
          }

          if (declareType[2]) {
            declareType[2].forEach((d, inx) => {
              if (typeof d[0] === 'number') {
                declareType[2][inx] = d2[d[0]]
              }
            })
          }

          const validateValue = validateAndConvertType(
            declareType,
            k,
            objectValue[k],
            allErrors,
            '',
            -1,
            classInstance,
            errorParam
          )
          if (objectValue[k] === undefined) {
            continue
          }
          classInstance[k] = validateValue
        }
        value = classInstance
      }
  }
  return value
}

const typeDisplayText = (val: any, isFirstLevel: boolean) => {
  if (typeof val === 'string') {
    if (isFirstLevel) {
      return val ? `'${val}'` : "''"
    }
    return "'" + val + "'"
  } else if (typeof val === 'object') {
    return JSON.stringify(val).replace(/"/g, "'").substring(0, 200)
  }
  return val
}

const getMetaData = (key: string, instance: any, methodName: string, paramIndex: number, propName: string) => {
  if (paramIndex >= 0) {
    return (Reflect.getMetadata(key, instance, methodName) || [])[paramIndex]
  } else {
    return Reflect.getMetadata(key, instance, propName)
  }
}

const getMessage = (validateMessage: ValidateMessage, value: any) => {
  if (!validateMessage) {
    return undefined
  }
  return typeof validateMessage === 'string' ? validateMessage : validateMessage(value)
}

const validateRequired = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[]
) => {
  let optional: boolean = getMetaData('optional', instance, methodName, paramIndex, propName)
  if (!optional && (propValue === undefined || propValue === null)) {
    errors.push({
      param: errorParam,
      message: `'${propName}' is required`
    })
  }
}

const validateNotEmptyOrBlank = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[]
) => {
  let optional: boolean = getMetaData('optional', instance, methodName, paramIndex, propName)
  if (!optional && propValue.length === 0) {
    errors.push({
      param: errorParam,
      message: `'${propName}' cannot be empty`
    })
  }

  let notBlack: boolean = getMetaData('notBlank', instance, methodName, paramIndex, propName)
  if (notBlack && typeof propValue === 'string') {
    if (propValue.trim().length === 0) {
      errors.push({
        param: errorParam,
        message: `'${propName}' cannot be blank`
      })
    }
  }
}

const validateEmail = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[]
) => {
  const isEmail: boolean = getMetaData('email', instance, methodName, paramIndex, propName)
  const emailRegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (isEmail && !emailRegExp.test(propValue)) {
    const message = getMetaData('message[email]', instance, methodName, paramIndex, propName)
    errors.push({
      param: errorParam,
      message: getMessage(message, propValue) || `'${propValue}' is no a valid email`
    })
  }
}

const validatePattern = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[],
  isFirstLevel: boolean
) => {
  const match: RegExp = getMetaData('pattern', instance, methodName, paramIndex, propName)
  if (match && !match.test(propValue)) {
    const message = getMetaData('message[pattern]', instance, methodName, paramIndex, propName)
    errors.push({
      param: errorParam,
      message: getMessage(message, propValue) || `${typeDisplayText(propValue, isFirstLevel)} is not match ${match}`
    })
  }
}

const validateMinMaxLength = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string | any[],
  errors: ValidateError[],
  isFirstLevel: boolean
) => {
  const maxLength = getMetaData('maxLen', instance, methodName, paramIndex, propName)
  if (maxLength !== undefined) {
    if (propValue.length > maxLength) {
      const message = getMetaData('message[maxLen]', instance, methodName, paramIndex, propName)
      errors.push({
        param: errorParam,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} length(${propValue.length}) should not greater than ${maxLength}`
      })
    }
  }
  const minLength = getMetaData('minLen', instance, methodName, paramIndex, propName)
  if (minLength !== undefined) {
    if (propValue.length < minLength) {
      const message = getMetaData('message[minLen]', instance, methodName, paramIndex, propName)
      errors.push({
        param: propName,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} length(${propValue.length})  should not less than ${minLength}`
      })
    }
  }
  const length = getMetaData('len', instance, methodName, paramIndex, propName)
  if (length !== undefined) {
    if (propValue.length !== length) {
      const message = getMetaData('message[len]', instance, methodName, paramIndex, propName)
      errors.push({
        param: propName,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} length(${propValue.length}) should equals to ${length}`
      })
    }
  }
  const lenRange = getMetaData('lenRange', instance, methodName, paramIndex, propName)
  if (lenRange !== undefined) {
    const [minLen, maxLen] = lenRange
    if (propValue.length < minLen || propValue.length > maxLen) {
      const message = getMetaData('message[lenRange]', instance, methodName, paramIndex, propName)
      errors.push({
        param: propName,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} length(${propValue.length}) should in [${minLen},${maxLen}]`
      })
    }
  }
}

const validateMinMax = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: number,
  errors: ValidateError[],
  isFirstLevel: boolean
) => {
  if (!instance) {
    return
  }
  const max = getMetaData('max', instance, methodName, paramIndex, propName)
  if (max !== undefined) {
    if (propValue > max) {
      const message = getMetaData('message[max]', instance, methodName, paramIndex, propName)
      errors.push({
        param: errorParam,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} should not greater than ${max} for field '${propName}'`
      })
    }
  }
  const min = getMetaData('min', instance, methodName, paramIndex, propName)
  if (min !== undefined) {
    if (propValue < min) {
      const message = getMetaData('message[min]', instance, methodName, paramIndex, propName)
      errors.push({
        param: propName,
        message:
          getMessage(message, propValue) ||
          `${typeDisplayText(propValue, isFirstLevel)} should not less than ${min} for field '${propName}'`
      })
    }
  }
}

const customValidate = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: number,
  errors: ValidateError[],
  isFirstLevel: boolean
) => {
  const validateFunc = getMetaData('validate', instance, methodName, paramIndex, propName)
  if (validateFunc) {
    try {
      const err = validateFunc(propValue)
      if (err !== true) {
        errors.push({
          param: errorParam,
          message: err || `${typeDisplayText(propValue, isFirstLevel)} is invalid`
        })
      }
    } catch (err) {
      errors.push({
        param: errorParam,
        message: `${typeDisplayText(propValue, isFirstLevel)} is invalid`
      })
    }
  }
}

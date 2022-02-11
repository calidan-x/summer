(global as any).Int = class Int {};
(global as any).Float = class Float {};

interface ValidateError {
  param: string;
  message: string;
}

export const validateAndConvertType = (
  type: any,
  declareType: any,
  propertyName: string,
  propValue: any,
  allErrors: ValidateError[],
  methodName = '',
  paramIndex = -1,
  instance = undefined,
  propertyNamePath = ''
) => {
  const isFirstLevel = paramIndex >= 0;
  const typeName = type?.name.toLowerCase();
  if (declareType === undefined && typeName !== 'array') {
    return propValue;
  }
  const declareTypeName = (declareType?.name || '').toLowerCase();
  let value: any = undefined;

  let errorParam = propertyNamePath + (propertyNamePath && !propertyName.startsWith('[') ? '.' : '') + propertyName;

  if (propValue === undefined) {
    validateRequired(instance, methodName, paramIndex, propertyName, errorParam, propValue, allErrors);
    return undefined;
  }

  switch (typeName) {
    case 'string':
      value = isFirstLevel ? propValue + '' : propValue;
      if (typeof value !== 'string') {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propValue, isFirstLevel) + ' is not a string'
        });
        break;
      }

      // string enum
      if (declareTypeName !== 'string' && typeof declareType === 'object') {
        value = declareType[propValue];
        if (value === undefined) {
          allErrors.push({
            param: errorParam,
            message:
              typeDisplayText(propValue, isFirstLevel) +
              ' is not in ' +
              JSON.stringify(
                Object.keys(declareType).filter((key) => typeof declareType[declareType[key]] !== 'number')
              ).replace(/"/g, "'")
          });
        }
      }

      validateEmail(instance, methodName, paramIndex, propertyName, errorParam, propValue, allErrors);
      validateMatch(instance, methodName, paramIndex, propertyName, errorParam, propValue, allErrors, isFirstLevel);
      validateMinMaxLength(
        instance,
        methodName,
        paramIndex,
        propertyName,
        errorParam,
        propValue,
        allErrors,
        isFirstLevel
      );
      break;
    case 'number':
    case 'float':
    case 'int':
    case 'bigint':
      const numVal = isFirstLevel ? Number(propValue) : propValue;
      if (declareTypeName === 'number') {
        if (Number.isNaN(numVal) || typeof numVal !== 'number') {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propValue, isFirstLevel) + ' is not a number'
          });
        }
        value = numVal;
      } else if (declareTypeName === 'int' || declareTypeName === 'bigint') {
        if (!Number.isInteger(numVal)) {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propValue, isFirstLevel) + ' is not an integer'
          });
        }
        value = numVal;
      } else if (declareTypeName === 'float') {
        if (Number.isNaN(numVal) || (numVal + '').indexOf('.') < 0) {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propValue, isFirstLevel) + ' is not a float'
          });
        }
        value = numVal;
      }
      // number enum
      else if (typeof declareType === 'object') {
        value = declareType[propValue];
        if (value === undefined || typeof value === 'string') {
          allErrors.push({
            param: errorParam,
            message:
              typeDisplayText(propValue, isFirstLevel) +
              ' is not in ' +
              JSON.stringify(
                Object.keys(declareType).filter((key) => typeof declareType[declareType[key]] !== 'number')
              ).replace(/"/g, "'")
          });
        }
      }
      validateMinMax(instance, methodName, paramIndex, propertyName, errorParam, value, allErrors, isFirstLevel);
      break;
    case 'boolean':
      if (isFirstLevel) {
        if (propValue.toLowerCase() === 'false' || propValue.toLowerCase() === '0') {
          value = false;
        } else if (propValue.toLowerCase() === 'true' || propValue.toLowerCase() === '1') {
          value = true;
        } else {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propValue, isFirstLevel) + ' is not a boolean'
          });
        }
      } else {
        value = propValue;
        if (typeof value !== 'boolean') {
          allErrors.push({
            param: errorParam,
            message: typeDisplayText(propValue, isFirstLevel) + ' is not a boolean'
          });
        }
      }
      break;
    case 'array':
      let arrayValue = [];
      try {
        arrayValue = isFirstLevel ? JSON.parse(propValue) : propValue;
      } catch (e) {
        allErrors.push({
          param: errorParam,
          message: 'error parsing ' + typeDisplayText(propValue, isFirstLevel)
        });
        break;
      }
      if (!Array.isArray(arrayValue)) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propValue, isFirstLevel) + ' is not an array'
        });
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
        );
        for (let i = 0; i < arrayValue.length; i++) {
          let arrValueType: any = declareType;
          if (typeof declareType === 'object') {
            arrValueType = String;
            for (const v in declareType) {
              if (typeof declareType[v] === 'number') {
                arrValueType = Number;
                break;
              }
            }
          }
          arrayValue[i] = validateAndConvertType(
            arrValueType,
            declareType,
            '[' + i + ']',
            arrayValue[i],
            allErrors,
            '',
            -1,
            arrayValue,
            errorParam
          );
        }
        value = arrayValue;
      }
      break;
    default:
      let classInstance = new type();
      let objectValue = {};
      try {
        objectValue = isFirstLevel ? JSON.parse(propValue) : propValue;
      } catch (e) {
        allErrors.push({
          param: errorParam,
          message: 'error parsing ' + typeDisplayText(propValue, isFirstLevel)
        });
        break;
      }

      if (Array.isArray(objectValue)) {
        allErrors.push({
          param: errorParam,
          message: typeDisplayText(propValue, isFirstLevel) + ' is not an object'
        });
      } else {
        const allProperties = [];
        let proto = classInstance.__proto__;
        while (proto.constructor.name !== 'Object') {
          allProperties.push(...Reflect.getOwnMetadataKeys(proto.constructor.prototype));
          proto = proto.__proto__;
        }
        for (const k in objectValue) {
          if (!allProperties.includes(k)) {
            allErrors.push({
              param: errorParam,
              message: typeDisplayText(k, isFirstLevel) + ' is not a valid key for ' + type.name
            });
          }
        }
        for (const k of allProperties) {
          let propType = Reflect.getMetadata('design:type', classInstance, k);
          let declareType = Reflect.getMetadata('DeclareType', classInstance, k);

          if (propType === undefined) {
            classInstance[k] = objectValue[k];
            continue;
          }

          classInstance[k] = validateAndConvertType(
            propType,
            declareType,
            k,
            objectValue[k],
            allErrors,
            '',
            -1,
            classInstance,
            errorParam
          );
        }
        value = classInstance;
      }
  }
  return value;
};

const typeDisplayText = (val: any, isFirstLevel: boolean) => {
  if (typeof val === 'string') {
    if (isFirstLevel) {
      return val.substr(0, 50);
    }
    return "'" + val.substr(0, 50) + "'";
  } else if (typeof val === 'object') {
    return JSON.stringify(val).replace(/"/g, "'").substr(0, 200);
  }
  return val;
};

const getMetaData = (key: string, instance: any, methodName: string, paramIndex: number, propName: string) => {
  if (paramIndex >= 0) {
    return (Reflect.getMetadata(key, instance, methodName) || [])[paramIndex];
  } else {
    return Reflect.getMetadata(key, instance, propName);
  }
};

const validateRequired = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[]
) => {
  let required: boolean = getMetaData('required', instance, methodName, paramIndex, propName);
  if (required && propValue === undefined) {
    errors.push({
      param: errorParam,
      message: `'${propName}' is required`
    });
  }
};

const validateEmail = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[]
) => {
  const isEmail: boolean = getMetaData('email', instance, methodName, paramIndex, propName);
  const emailRegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (isEmail && !emailRegExp.test(propValue)) {
    errors.push({
      param: errorParam,
      message: `'${propValue}' is no a valid email`
    });
  }
};

const validateMatch = (
  instance: any,
  methodName,
  paramIndex: number,
  propName: string,
  errorParam: string,
  propValue: string,
  errors: ValidateError[],
  isFirstLevel: boolean
) => {
  const match: RegExp = getMetaData('match', instance, methodName, paramIndex, propName);
  if (match && !match.test(propValue)) {
    errors.push({
      param: errorParam,
      message: `'${typeDisplayText(propValue, isFirstLevel)}' is not match ${match}`
    });
  }
};

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
  let maxLength = getMetaData('maxLength', instance, methodName, paramIndex, propName);
  if (maxLength !== undefined) {
    if (propValue.length > maxLength) {
      errors.push({
        param: errorParam,
        message: `${typeDisplayText(propValue, isFirstLevel)} length(${
          propValue.length
        }) should not greater than ${maxLength}`
      });
    }
  }
  const minLength = getMetaData('minLength', instance, methodName, paramIndex, propName);
  if (minLength !== undefined) {
    if (propValue.length < minLength) {
      errors.push({
        param: propName,
        message: `${typeDisplayText(propValue, isFirstLevel)} length(${
          propValue.length
        })  should not less than ${minLength}`
      });
    }
  }
};

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
    return;
  }
  const max = getMetaData('max', instance, methodName, paramIndex, propName);
  if (max !== undefined) {
    if (propValue > max) {
      errors.push({
        param: errorParam,
        message: `${typeDisplayText(propValue, isFirstLevel)} should not greater than ${max} for field '${propName}'`
      });
    }
  }
  const min = getMetaData('min', instance, methodName, paramIndex, propName);
  if (min !== undefined) {
    if (propValue < min) {
      errors.push({
        param: propName,
        message: `${typeDisplayText(propValue, isFirstLevel)} should not less than ${min} for field '${propName}'`
      });
    }
  }
};

import { request } from '@summer-js/test'

type TestTypes =
  | 'notype'
  | 'any'
  | 'number'
  | 'string'
  | 'int'
  | 'bigint'
  | 'float'
  | 'boolean'
  | 'numberEnum'
  | 'stringEnum'
  | 'anyArray'
  | 'stringArray'
  | 'numberArray'
  | 'intArray'
  | 'floatArray'
  | 'booleanArray'
  | 'numberEnumArray'
  | 'stringEnumArray'
  | 'obj'
  | 'objArray'
  | 'stringUnion'
  | 'fixedString'

const typeVal = (value) => {
  return { type: typeof value, value }
}

const testRequestParam = async (requestValue: string, convertType: TestTypes, resultValue: any) => {
  const response = await request.get('/request-basic-type-value', {
    [convertType + 'Value']: requestValue
  })
  expect(response.body).toStrictEqual(typeVal(resultValue))
}

const testErrorRequestParam = async (requestValue: string, convertType: TestTypes, errorMessage: any) => {
  const response = await request.get('/request-basic-type-value', {
    [convertType + 'Value']: requestValue
  })
  expect(response.rawBody).toContain(errorMessage)
}

describe('Controller Params Test', () => {
  test('test no type request value', async () => {
    await testRequestParam('hello', 'notype', 'hello')
  })

  test('test any type request value', async () => {
    await testRequestParam('hello', 'notype', 'hello')
  })

  test('test string type request value', async () => {
    await testRequestParam('hello', 'string', 'hello')
  })

  test('test number type request value', async () => {
    await testErrorRequestParam('hello', 'number', 'is not a number')
    await testErrorRequestParam(null as any, 'number', 'is not a number')
    await testRequestParam('123', 'number', 123)
    await testRequestParam('123.123', 'number', 123.123)
    await testRequestParam('-123', 'number', -123)
  })

  test('test int type request value', async () => {
    await testErrorRequestParam('hello', 'int', 'is not an integer')
    await testErrorRequestParam('123.123', 'int', 'is not an integer')
    await testErrorRequestParam(null as any, 'int', 'is not an integer')
    await testRequestParam('123', 'int', 123)
    await testRequestParam('-123', 'int', -123)
  })

  test('test bigint type request value', async () => {
    await testErrorRequestParam('hello', 'bigint', 'cannot convert to a BigInt')
    await testErrorRequestParam('123.123', 'bigint', 'cannot convert to a BigInt')
    // await testRequestParam('123', 'bigint', 123n)
    // await testRequestParam('-123', 'bigint', -123n)
  })

  test('test boolean type request value', async () => {
    await testErrorRequestParam('hello', 'boolean', 'is not a boolean')
    await testErrorRequestParam('123', 'boolean', 'is not a boolean')
    await testRequestParam('1', 'boolean', true)
    await testRequestParam('0', 'boolean', false)
    await testRequestParam('true', 'boolean', true)
    await testRequestParam('false', 'boolean', false)
    let response = await request.get('/request-queries?isCity=true&name=shanghai&count=1')
    expect(response.body).toEqual({ isCity: true, name: 'shanghai', count: 1 })
    response = await request.get('/request-queries?isCity=1&name=shanghai&count=1')
    expect(response.body).toEqual({ isCity: true, name: 'shanghai', count: 1 })
    response = await request.get('/request-queries?isCity=false&name=new york&count=1')
    expect(response.body).toEqual({ isCity: false, name: 'new york', count: 1 })
  })

  test('test number enum type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnum', 'is not in [\\"E1\\",\\"E2\\"]')
    await testErrorRequestParam('1', 'numberEnum', 'is not in [\\"E1\\",\\"E2\\"]')
    await testRequestParam('E1', 'numberEnum', 1)
    await testRequestParam('E2', 'numberEnum', 2)
  })

  test('test string enum type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnum', 'is not in [\\"E1\\",\\"E2\\"]')
    await testErrorRequestParam('1', 'stringEnum', 'is not in [\\"E1\\",\\"E2\\"]')
    await testRequestParam('E1', 'stringEnum', 'E1')
    await testRequestParam('E2', 'stringEnum', 'E2')
  })

  test('test any array type request value', async () => {
    await testErrorRequestParam('hello', 'anyArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'anyArray', 'is not an array')
    await testRequestParam('[0,2,3]', 'anyArray', [0, 2, 3])
    await testRequestParam('["Hello","Hi","Hey"]', 'anyArray', ['Hello', 'Hi', 'Hey'])
    await testRequestParam('[true,123,"hello"]', 'anyArray', [true, 123, 'hello'])
  })

  test('test string array type request value', async () => {
    await testErrorRequestParam('hello', 'stringArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'stringArray', 'is not an array')
    await testErrorRequestParam('[0,2,3]', 'stringArray', 'is not a string')
    await testErrorRequestParam('[true,123,"hello"]', 'stringArray', 'is not a string')
    await testRequestParam('["Hello","Hi","Hey"]', 'stringArray', ['Hello', 'Hi', 'Hey'])
  })

  test('test number array type request value', async () => {
    await testErrorRequestParam('hello', 'numberArray', 'is not a number')
    await testErrorRequestParam('{"a":123}', 'numberArray', 'is not an array')
    await testErrorRequestParam('[0,"2-",3]', 'numberArray', 'is not a number')
    await testErrorRequestParam('[true,123,"hello"]', 'numberArray', 'is not a number')
    await testRequestParam('[1,2,3,32.23]', 'numberArray', [1, 2, 3, 32.23])
    await testRequestParam('1,2,3,32.23', 'numberArray', [1, 2, 3, 32.23])
  })

  test('test int array type request value', async () => {
    await testErrorRequestParam('hello', 'intArray', 'is not an integer')
    await testErrorRequestParam('{"a":123}', 'intArray', 'is not an array')
    await testErrorRequestParam('[0,"2-",3]', 'intArray', 'is not an integer')
    await testErrorRequestParam('[1,2,3,32.23]', 'intArray', 'is not an integer')
    await testRequestParam('[1,-2,3,32]', 'intArray', [1, -2, 3, 32])
    await testRequestParam('1,-2,3,32', 'intArray', [1, -2, 3, 32])
  })

  test('test boolean array type request value', async () => {
    await testErrorRequestParam('hello', 'booleanArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'booleanArray', 'is not an array')
    await testErrorRequestParam('[0,1,3]', 'booleanArray', 'is not a boolean')
    await testRequestParam('[true,false,true,false]', 'booleanArray', [true, false, true, false])
  })

  test('test number enum array type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnumArray', 'error parsing')
    await testErrorRequestParam('["hello","E1"]', 'numberEnumArray', 'is not in [\\"E1\\",\\"E2\\"]')
    await testErrorRequestParam('["1","E1"]', 'numberEnumArray', 'is not in [\\"E1\\",\\"E2\\"]')
    await testRequestParam('["E1","E2"]', 'numberEnumArray', [1, 2])
  })

  test('test string enum array type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnumArray', 'error parsing')
    await testErrorRequestParam('["hello","E1"]', 'stringEnumArray', 'is not in [\\"E1\\",\\"E2\\"]')
    await testRequestParam('["E1","E2"]', 'stringEnumArray', ['E1', 'E2'])
  })

  test('test string union type request value', async () => {
    await testErrorRequestParam('SU4', 'stringUnion', 'is not in [\\"SU1\\",\\"SU2\\",\\"SU:3\\"]')
    await testRequestParam('SU1', 'stringUnion', 'SU1')
  })

  test('test fixed string type request value', async () => {
    await testRequestParam('str:ing', 'fixedString', 'str:ing')
    await testErrorRequestParam('str', 'fixedString', "is not equals 'str:ing'")
  })

  test('test ignore unknown key', async () => {
    let result = await request.post('/request-key-validate/ignore-unknown-props', { a: 123, b: 'str', c: 100 })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ a: 123, b: 'str' })

    result = await request.post('/request-key-validate/validate-unknown-props', { a: 123, b: 'str', c: 100 })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'c' is not a valid key of")
  })

  test('test optional and required and empty key', async () => {
    let result = await request.post('/request-key-validate/optional', {
      optionalKey: 'optionalKey',
      requiredKey: 'requiredKey'
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ optionalKey: 'optionalKey', requiredKey: 'requiredKey' })

    result = await request.post('/request-key-validate/optional', { requiredKey: 'requiredKey' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ requiredKey: 'requiredKey' })

    result = await request.post('/request-key-validate/optional', { optionalKey: null, requiredKey: 'requiredKey' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ optionalKey: null, requiredKey: 'requiredKey' })

    result = await request.post('/request-key-validate/optional', { optionalInteger: null, requiredKey: 'requiredKey' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ optionalInteger: null, requiredKey: 'requiredKey' })

    result = await request.post('/request-key-validate/optional', { optionalKey: 'optionalKey' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'requiredKey' is required")

    result = await request.post('/request-key-validate/optional-no-type', {})
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'headerKey' is required")

    result = await request.post('/request-key-validate/optional-no-type', '', { headers: { headerKey: '' } })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'headerKey' cannot be empty")

    result = await request.post('/request-key-validate/optional-no-type', null, { headers: { headerKey: 'value' } })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe('value')

    result = await request.post('/request-key-validate/param-optional')
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe('')

    result = await request.post('/request-key-validate/param-required')
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'keyword' is required")

    result = await request.post('/request-key-validate/param-empty', {
      normal: '',
      notEmptyString: ''
    })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'notEmptyString' cannot be empty")

    result = await request.post('/request-key-validate/param-empty', {
      notEmptyString: 'xxxx'
    })
    expect(result.statusCode).toBe(200)

    result = await request.post('/optional-body', 123)
    expect(result.statusCode).toBe(200)
    expect(result.rawBody).toBe('number123')

    result = await request.post('/optional-body', 'fff')
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('is not an integer')

    result = await request.post('/optional-body', '')
    expect(result.statusCode).toBe(200)
    expect(result.rawBody).toContain('undefinedundefined')

    result = await request.post('/optional-body')
    expect(result.statusCode).toBe(200)
    expect(result.rawBody).toContain('undefinedundefined')

    result = await request.post('/optional-body-object', '')
    expect(result.statusCode).toBe(200)
    expect(result.rawBody).toContain('undefined')

    result = await request.post('/optional-body-object')
    expect(result.statusCode).toBe(200)
    expect(result.rawBody).toContain('undefined')
  })

  test('test blank key', async () => {
    let result = await request.post('/request-key-validate/blank', {
      blankKey: ' s '
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ blankKey: ' s ' })

    result = await request.post('/request-key-validate/blank', {
      blankKey: '   '
    })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('cannot be blank')

    result = await request.post('/request-key-validate/blank', {
      blankKey: ''
    })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('cannot be empty')
  })

  test('test @Min', async () => {
    let result = await request.post('/request-key-validate/min', {
      min: 12
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ min: 12 })

    result = await request.post('/request-key-validate/min', { min: 7 })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("7 should not less than 10 for field 'min'")
  })

  test('test @Max', async () => {
    let result = await request.post('/request-key-validate/max', { max: 8 })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ max: 8 })

    result = await request.post('/request-key-validate/max', { max: 14 })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("14 should not greater than 10 for field 'max'")
  })

  test('test @MinLen', async () => {
    let result = await request.post('/request-key-validate/min-len', { minLen: 'xxxxxxxxxxxxx' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ minLen: 'xxxxxxxxxxxxx' })

    result = await request.post('/request-key-validate/min-len', { minLen: 'xxx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('length(3)  should not less than 5')
  })

  test('test @MaxLen', async () => {
    let result = await request.post('/request-key-validate/max-len', { maxLen: 'xxx' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ maxLen: 'xxx' })

    result = await request.post('/request-key-validate/max-len', { maxLen: 'xxxxxxxxxxxxx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('length(13) should not greater than 5')
  })

  test('test @Len', async () => {
    let result = await request.post('/request-key-validate/len', { len: 'xxxxx', lenRange: 'xx' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ len: 'xxxxx', lenRange: 'xx' })

    result = await request.post('/request-key-validate/len', { len: 'xxx', lenRange: 'xx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('length(3) should equals to 5')

    result = await request.post('/request-key-validate/len', { len: 'xxxxx', lenRange: 'x' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('length(1) should in [2,5]')

    result = await request.post('/request-key-validate/len', { len: 'xxxxx', lenRange: 'xxxxxxx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('length(7) should in [2,5]')
  })

  test('test @Email', async () => {
    let result = await request.post('/request-key-validate/email', { email: 'aa@bb.com' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ email: 'aa@bb.com' })

    result = await request.post('/request-key-validate/email', { email: 'not an email' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain("'not an email' is no a valid email")
  })

  test('test @Pattern', async () => {
    let result = await request.post('/request-key-validate/pattern', { pattern: '123123' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ pattern: '123123' })

    result = await request.post('/request-key-validate/pattern', { pattern: 'xxx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('is not match')
  })

  test('test @Pattern', async () => {
    let result = await request.post('/request-key-validate/pattern', { pattern: '123123' })
    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ pattern: '123123' })

    result = await request.post('/request-key-validate/pattern', { pattern: 'xxx' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('is not match')
  })

  test('test @Validate', async () => {
    let result = await request.post('/request-key-validate/custom-validate', {
      value: 'aaaaa,bbbb',
      value2: 'aaaaa,bbbb'
    })

    expect(result.statusCode).toBe(200)
    expect(result.body).toStrictEqual({ value: 'aaaaa,bbbb', value2: 'aaaaa,bbbb' })

    result = await request.post('/request-key-validate/custom-validate', { value: 'cccccc', value2: 'sssss' })
    expect(result.statusCode).toBe(400)
    expect(result.rawBody).toContain('Data must has')
    expect(result.rawBody).toContain('is invalid')
  })

  test('test enum', async () => {
    const postBody = {
      genderNum: 'Female',
      genderStr: 'Male',
      obj: {
        genderNum: 'Female',
        genderStr: 'Male'
      },
      arr: [
        {
          genderNum: 'Female',
          genderStr: 'Male'
        }
      ]
    }
    const result = await request.post('/request-key-validate/enum', postBody)
    expect(result.body).toStrictEqual(postBody)
  })

  test('test Date', async () => {
    const postBody = {
      date: '2012-12-12T00:00:00.000Z'
    }
    const result = await request.post('/request-key-validate/date', postBody)
    expect(result.body).toStrictEqual(postBody)
  })

  test('test generic', async () => {
    {
      const postBody = {
        int: 123,
        dir: ['Up'],
        intArr: [1, 2, 3],
        field1: ['aaa', 'bbb'],
        field2: 123,
        obj: {
          a: 23,
          b: 'sdf'
        },
        date: '2012-12-12',
        g: {
          a: 123,
          b: '123',
          d: '2020-01-01 00:00:00'
        },
        z: { a: true, b: 'b', d: '2022-12-12' },
        x: { a: 123, b: 'b', d: '2022-12-12' },
        w: [{ a: 123, b: 'b' }],
        o: ['hhh', 'wwww']
      }

      const resBody = {
        int: 123,
        dir: ['Up'],
        intArr: [1, 2, 3],
        field1: ['aaa', 'bbb'],
        field2: 123,
        obj: {
          a: 23,
          b: 'sdf'
        },
        date: '2012-12-12T00:00:00.000Z',
        g: {
          a: 123,
          b: '123',
          d: '2019-12-31T16:00:00.000Z'
        },
        z: { a: true, b: 'b', d: '2022-12-12T00:00:00.000Z' },
        x: { a: 123, b: 'b', d: '2022-12-12T00:00:00.000Z' },
        w: [{ a: 123, b: 'b' }],
        o: ['hhh', 'wwww']
      }

      const result = await request.post('/generic-type', postBody)
      expect(result.statusCode).toBe(200)
      expect(result.body).toStrictEqual(resBody)
    }

    {
      const postBody = {
        int: 123,
        dir: ['Up'],
        intArr: [1, 2, 3],
        field1: ['aaa', 'bbb'],
        field2: 123,
        obj: {
          a: 23,
          b: 'sdf'
        },
        date: '2012-12-12',
        g: {
          a: 'www',
          b: '123',
          d: '2020-01-01'
        },
        z: { a: true, b: 'b', d: '2022-12-12' },
        x: { a: '123', b: 'b', d: '2022-12-12' },
        w: [{ a: 'ooo', b: 'b' }],
        o: ['hhh', 'wwww']
      }

      const result = await request.post('/generic-type', postBody)
      expect(result.statusCode).toBe(400)
      expect(result.rawBody).toContain("'www' is not a number")
      expect(result.rawBody).toContain("'ooo' is not a number")
    }

    {
      const result = await request.get('/generic-type/mixed-object-return')
      expect(result.statusCode).toBe(200)
      expect(result.rawBody).toContain('{"hello":"World","g":{"a":123,"b":"sss","d":')
    }
  })
})

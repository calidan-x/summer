import { initTest, endTest, request } from '@summer-js/test'

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
  return JSON.stringify({ type: typeof value, value })
}

const testRequestParam = async (requestValue: string, convertType: TestTypes, resultValue: any) => {
  const response = await request.get('/request-basic-type-value', {
    queries: {
      [convertType + 'Value']: requestValue
    }
  })
  expect(response.body).toBe(typeVal(resultValue))
}

const testErrorRequestParam = async (requestValue: string, convertType: TestTypes, errorMessage: any) => {
  const response = await request.get('/request-basic-type-value', {
    queries: {
      [convertType + 'Value']: requestValue
    }
  })
  expect(response.body).toContain(errorMessage)
}

describe('Controller Params Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

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
    await testRequestParam('123', 'number', 123)
    await testRequestParam('123.123', 'number', 123.123)
    await testRequestParam('-123', 'number', -123)
  })

  test('test int type request value', async () => {
    await testErrorRequestParam('hello', 'int', 'is not an integer')
    await testErrorRequestParam('123.123', 'int', 'is not an integer')
    await testRequestParam('123', 'int', 123)
    await testRequestParam('-123', 'int', -123)
  })

  test('test bigint type request value', async () => {
    await testErrorRequestParam('hello', 'bigint', 'is not an integer')
    await testErrorRequestParam('123.123', 'bigint', 'is not an integer')
    await testRequestParam('123', 'bigint', 123)
    await testRequestParam('-123', 'bigint', -123)
  })

  test('test boolean type request value', async () => {
    await testErrorRequestParam('hello', 'boolean', 'is not a boolean')
    await testErrorRequestParam('123', 'boolean', 'is not a boolean')
    await testRequestParam('1', 'boolean', true)
    await testRequestParam('0', 'boolean', false)
    await testRequestParam('true', 'boolean', true)
    await testRequestParam('false', 'boolean', false)
  })

  test('test number enum type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnum', "is not in ['E1','E2']")
    await testErrorRequestParam('1', 'numberEnum', "is not in ['E1','E2']")
    await testRequestParam('E1', 'numberEnum', 1)
    await testRequestParam('E2', 'numberEnum', 2)
  })

  test('test string enum type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnum', "is not in ['E1','E2']")
    await testErrorRequestParam('1', 'stringEnum', "is not in ['E1','E2']")
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
    await testErrorRequestParam('hello', 'numberArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'numberArray', 'is not an array')
    await testErrorRequestParam('[0,"2-",3]', 'numberArray', 'is not a number')
    await testErrorRequestParam('[true,123,"hello"]', 'numberArray', 'is not a number')
    await testRequestParam('[1,2,3,32.23]', 'numberArray', [1, 2, 3, 32.23])
  })

  test('test int array type request value', async () => {
    await testErrorRequestParam('hello', 'intArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'intArray', 'is not an array')
    await testErrorRequestParam('[0,"2-",3]', 'intArray', 'is not an integer')
    await testErrorRequestParam('[1,2,3,32.23]', 'intArray', 'is not an integer')
    await testRequestParam('[1,-2,3,32]', 'intArray', [1, -2, 3, 32])
  })

  test('test boolean array type request value', async () => {
    await testErrorRequestParam('hello', 'booleanArray', 'error parsing')
    await testErrorRequestParam('{"a":123}', 'booleanArray', 'is not an array')
    await testErrorRequestParam('[0,1,3]', 'booleanArray', 'is not a boolean')
    await testRequestParam('[true,false,true,false]', 'booleanArray', [true, false, true, false])
  })

  test('test number enum array type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnumArray', 'error parsing')
    await testErrorRequestParam('["hello","E1"]', 'numberEnumArray', "is not in ['E1','E2']")
    await testErrorRequestParam('["1","E1"]', 'numberEnumArray', "is not in ['E1','E2']")
    await testRequestParam('["E1","E2"]', 'numberEnumArray', [1, 2])
  })

  test('test string enum array type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnumArray', 'error parsing')
    await testErrorRequestParam('["hello","E1"]', 'stringEnumArray', "is not in ['E1','E2']")
    await testRequestParam('["E1","E2"]', 'stringEnumArray', ['E1', 'E2'])
  })

  test('test string union type request value', async () => {
    await testErrorRequestParam('SU4', 'stringUnion', "is not in ['SU1','SU2','SU:3']")
    await testRequestParam('SU1', 'stringUnion', 'SU1')
  })

  test('test fixed string type request value', async () => {
    await testRequestParam('str:ing', 'fixedString', 'str:ing')
    await testErrorRequestParam('str', 'fixedString', "is not in ['str:ing']")
  })

  test('test optional key', async () => {
    let result = await request.post('/request-key-validate/optional', {
      body: { optionalKey: 'optionalKey', requiredKey: 'requiredKey' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ optionalKey: 'optionalKey', requiredKey: 'requiredKey' }))

    result = await request.post('/request-key-validate/optional', {
      body: { requiredKey: 'requiredKey' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ requiredKey: 'requiredKey' }))

    result = await request.post('/request-key-validate/optional', {
      body: { optionalKey: 'optionalKey' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain("'requiredKey' is required")
  })

  test('test @Min', async () => {
    let result = await request.post('/request-key-validate/min', {
      body: { min: 12 }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ min: 12 }))

    result = await request.post('/request-key-validate/min', {
      body: { min: 7 }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain("7 should not less than 10 for field 'min'")
  })

  test('test @Max', async () => {
    let result = await request.post('/request-key-validate/max', {
      body: { max: 8 }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ max: 8 }))

    result = await request.post('/request-key-validate/max', {
      body: { max: 14 }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain("14 should not greater than 10 for field 'max'")
  })

  test('test @MinLen', async () => {
    let result = await request.post('/request-key-validate/min-len', {
      body: { minLen: 'xxxxxxxxxxxxx' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ minLen: 'xxxxxxxxxxxxx' }))

    result = await request.post('/request-key-validate/min-len', {
      body: { minLen: 'xxx' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain('length(3)  should not less than 5')
  })

  test('test @MaxLen', async () => {
    let result = await request.post('/request-key-validate/max-len', {
      body: { maxLen: 'xxx' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ maxLen: 'xxx' }))

    result = await request.post('/request-key-validate/max-len', {
      body: { maxLen: 'xxxxxxxxxxxxx' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain('length(13) should not greater than 5')
  })

  test('test @Email', async () => {
    let result = await request.post('/request-key-validate/email', {
      body: { email: 'aa@bb.com' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ email: 'aa@bb.com' }))

    result = await request.post('/request-key-validate/email', {
      body: { email: 'not an email' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain("'not an email' is no a valid email")
  })

  test('test @Pattern', async () => {
    let result = await request.post('/request-key-validate/pattern', {
      body: { pattern: '123123' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ pattern: '123123' }))

    result = await request.post('/request-key-validate/pattern', {
      body: { pattern: 'xxx' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain('is not match')
  })

  test('test @Pattern', async () => {
    let result = await request.post('/request-key-validate/pattern', {
      body: { pattern: '123123' }
    })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ pattern: '123123' }))

    result = await request.post('/request-key-validate/pattern', {
      body: { pattern: 'xxx' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain('is not match')
  })

  test('test @Validate', async () => {
    let result = await request.post('/request-key-validate/custom-validate', {
      body: { value: 'aaaaa,bbbb' }
    })

    expect(result.statusCode).toBe(200)
    expect(result.body).toBe(JSON.stringify({ value: 'aaaaa,bbbb' }))

    result = await request.post('/request-key-validate/custom-validate', {
      body: { value: 'cccccc' }
    })
    expect(result.statusCode).toBe(400)
    expect(result.body).toContain('is invalid')
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
    const result = await request.post('/request-key-validate/enum', {
      body: postBody
    })
    expect(result.body).toBe(JSON.stringify(postBody))
  })

  test('test Date/DateTime/TimeStamp', async () => {
    const postBody = {
      date: '2012-12-12',
      dateTime: '2012-12-12 12:12:12',
      timeStamp: 165387799000,
      dates: ['2012-12-12', '2012-12-12'],
      dateTimes: ['2012-12-12 12:12:12', '2012-12-12 12:12:12'],
      timeStamps: [165387799000, 165387799000]
    }
    const result = await request.post('/request-key-validate/date', {
      body: postBody
    })
    expect(result.body).toBe(JSON.stringify(postBody))
  })
})

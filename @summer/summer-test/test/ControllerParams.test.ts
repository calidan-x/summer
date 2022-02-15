import { Context, requestHandler, Summer } from '@summer/summer';

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
  | 'objArray';

const typeVal = (value) => {
  return JSON.stringify({ type: typeof value, value });
};

const testRequestParam = async (requestValue: string, convertType: TestTypes, resultValue: any) => {
  const context: Context = {
    request: {
      method: 'GET',
      path: '/request-basic-type-value',
      queries: {
        [convertType + 'Value']: requestValue
      }
    },
    response: { code: 200, body: '', contentType: '' }
  };
  await requestHandler(context);
  expect(context.response.body).toBe(typeVal(resultValue));
};

const testErrorRequestParam = async (requestValue: string, convertType: TestTypes, errorMessage: any) => {
  const context: Context = {
    request: {
      method: 'GET',
      path: '/request-basic-type-value',
      queries: {
        [convertType + 'Value']: requestValue
      }
    },
    response: { code: 200, body: '', contentType: '' }
  };
  await requestHandler(context);
  expect(context.response.body).toContain(errorMessage);
};

describe('Controller Params Test', () => {
  beforeAll(async () => {
    await Summer.initTest();
  });

  afterAll(async () => {
    await Summer.endTest();
  });

  test('test no type request value', async () => {
    await testRequestParam('hello', 'notype', 'hello');
  });

  test('test any type request value', async () => {
    await testRequestParam('hello', 'notype', 'hello');
  });

  test('test string type request value', async () => {
    await testRequestParam('hello', 'string', 'hello');
  });

  test('test number type request value', async () => {
    await testErrorRequestParam('hello', 'number', 'is not a number');
    await testRequestParam('123', 'number', 123);
    await testRequestParam('123.123', 'number', 123.123);
    await testRequestParam('-123', 'number', -123);
  });

  test('test int type request value', async () => {
    await testErrorRequestParam('hello', 'int', 'is not an integer');
    await testErrorRequestParam('123.123', 'int', 'is not an integer');
    await testRequestParam('123', 'int', 123);
    await testRequestParam('-123', 'int', -123);
  });

  test('test bigint type request value', async () => {
    await testErrorRequestParam('hello', 'bigint', 'is not an integer');
    await testErrorRequestParam('123.123', 'bigint', 'is not an integer');
    await testRequestParam('123', 'bigint', 123);
    await testRequestParam('-123', 'bigint', -123);
  });

  test('test float type request value', async () => {
    await testErrorRequestParam('hello', 'float', 'is not a float');
    await testErrorRequestParam('123', 'float', 'is not a float');
    await testRequestParam('-123.123', 'float', -123.123);
    await testRequestParam('.123', 'float', 0.123);
  });

  test('test boolean type request value', async () => {
    await testErrorRequestParam('hello', 'boolean', 'is not a boolean');
    await testErrorRequestParam('123', 'boolean', 'is not a boolean');
    await testRequestParam('1', 'boolean', true);
    await testRequestParam('0', 'boolean', false);
    await testRequestParam('true', 'boolean', true);
    await testRequestParam('false', 'boolean', false);
  });

  test('test number enum type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnum', "is not in ['E1','E2']");
    await testErrorRequestParam('1', 'numberEnum', "is not in ['E1','E2']");
    await testRequestParam('E1', 'numberEnum', 1);
    await testRequestParam('E2', 'numberEnum', 2);
  });

  test('test string enum type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnum', "is not in ['E1','E2']");
    await testErrorRequestParam('1', 'stringEnum', "is not in ['E1','E2']");
    await testRequestParam('E1', 'stringEnum', 'E1');
    await testRequestParam('E2', 'stringEnum', 'E2');
  });

  test('test any array type request value', async () => {
    await testErrorRequestParam('hello', 'anyArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'anyArray', 'is not an array');
    await testRequestParam('[0,2,3]', 'anyArray', [0, 2, 3]);
    await testRequestParam('["Hello","Hi","Hey"]', 'anyArray', ['Hello', 'Hi', 'Hey']);
    await testRequestParam('[true,123,"hello"]', 'anyArray', [true, 123, 'hello']);
  });

  test('test string array type request value', async () => {
    await testErrorRequestParam('hello', 'stringArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'stringArray', 'is not an array');
    await testErrorRequestParam('[0,2,3]', 'stringArray', 'is not a string');
    await testErrorRequestParam('[true,123,"hello"]', 'stringArray', 'is not a string');
    await testRequestParam('["Hello","Hi","Hey"]', 'stringArray', ['Hello', 'Hi', 'Hey']);
  });

  test('test number array type request value', async () => {
    await testErrorRequestParam('hello', 'numberArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'numberArray', 'is not an array');
    await testErrorRequestParam('[0,"2",3]', 'numberArray', 'is not a number');
    await testErrorRequestParam('[true,123,"hello"]', 'numberArray', 'is not a number');
    await testRequestParam('[1,2,3,32.23]', 'numberArray', [1, 2, 3, 32.23]);
  });

  test('test int array type request value', async () => {
    await testErrorRequestParam('hello', 'intArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'intArray', 'is not an array');
    await testErrorRequestParam('[0,"2",3]', 'intArray', 'is not an integer');
    await testErrorRequestParam('[1,2,3,32.23]', 'intArray', 'is not an integer');
    await testRequestParam('[1,-2,3,32]', 'intArray', [1, -2, 3, 32]);
  });

  test('test float array type request value', async () => {
    await testErrorRequestParam('hello', 'floatArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'floatArray', 'is not an array');
    await testErrorRequestParam('[0,"2",3]', 'floatArray', 'is not a float');
    await testErrorRequestParam('[1,2,3,32.23]', 'floatArray', 'is not a float');
    await testRequestParam('[1.3,-2.2,3.2,32.3]', 'floatArray', [1.3, -2.2, 3.2, 32.3]);
  });

  test('test boolean array type request value', async () => {
    await testErrorRequestParam('hello', 'booleanArray', 'error parsing');
    await testErrorRequestParam('{"a":123}', 'booleanArray', 'is not an array');
    await testErrorRequestParam('[0,1,3]', 'booleanArray', 'is not a boolean');
    await testRequestParam('[true,false,true,false]', 'booleanArray', [true, false, true, false]);
  });

  test('test number enum array type request value', async () => {
    await testErrorRequestParam('hello', 'numberEnumArray', 'error parsing');
    await testErrorRequestParam('["hello","E1"]', 'numberEnumArray', "is not in ['E1','E2']");
    await testErrorRequestParam('["1","E1"]', 'numberEnumArray', "is not in ['E1','E2']");
    await testRequestParam('["E1","E2"]', 'numberEnumArray', [1, 2]);
  });

  test('test number string array type request value', async () => {
    await testErrorRequestParam('hello', 'stringEnumArray', 'error parsing');
    await testErrorRequestParam('["hello","E1"]', 'stringEnumArray', "is not in ['E1','E2']");
    await testRequestParam('["E1","E2"]', 'stringEnumArray', ['E1', 'E2']);
  });
});

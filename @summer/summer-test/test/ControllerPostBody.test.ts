import { Context, requestHandler, Summer } from '@summer/summer';

const typeVal = (value) => {
  return JSON.stringify({ type: typeof value, value });
};

const testRequestParam = async (requestValue: string, resultValue: any) => {
  const context: Context = {
    request: {
      method: 'POST',
      path: '/request-body-value',
      body: requestValue
    },
    response: { code: 200, body: '', contentType: '' }
  };
  await requestHandler(context);
  expect(context.response.body).toBe(typeVal(resultValue));
};

const testErrorRequestParam = async (requestValue: string, errorMessage: any) => {
  const context: Context = {
    request: {
      method: 'POST',
      path: '/request-body-value',
      body: requestValue
    },
    response: { code: 200, body: '', contentType: '' }
  };
  await requestHandler(context);
  expect(context.response.body).toContain(errorMessage);
};

describe('Controller Object Convert Test', () => {
  beforeAll(async () => {
    await Summer.initTest();
  });

  afterAll(async () => {
    await Summer.endTest();
  });

  test('test object convert', async () => {
    await testErrorRequestParam(
      `{
      "id":1,
      "name":"Max",
      "tailLength":33.12,
      "gender":"Male",
      "toys":[
         {
           "id":1,
           "name":123
         },
        {
           "id":1,
           "name":"Little Monkey"
         }
      ],
      "eyeColor":"Brown"
      
      }`,
      'is not a string'
    );

    await testRequestParam(
      `{
      "id":1,
      "name":"Max",
      "gender":"Male",
      "tailLength":33.12,
      "toys":[
         {
           "id":1,
           "name":"Little Elephant"
         },
        {
           "id":1,
           "name":"Little Monkey"
         }
      ],
      "eyeColor":"Brown"
      
      }`,
      {
        eyeColor: 'brown',
        tailLength: 33.12,
        toys: [
          {
            id: 1,
            name: 'Little Elephant'
          },
          {
            id: 1,
            name: 'Little Monkey'
          }
        ],
        id: 1,
        name: 'Max',
        gender: 1
      }
    );
  });
});

import { initTest, endTest, request } from '@summer-js/test'

const typeVal = (value) => {
  return JSON.stringify({ type: typeof value, value })
}

const testRequestParam = async (requestValue: string, resultValue: any) => {
  const response = await request.post('/request-body-value', { body: requestValue })
  expect(response.body).toBe(typeVal(resultValue))
}

const testErrorRequestParam = async (requestValue: string, errorMessage: any) => {
  const response = await request.post('/request-body-value', { body: requestValue })
  expect(response.body).toContain(errorMessage)
}

describe('Controller Object Convert Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

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
    )

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
    )
  })
})

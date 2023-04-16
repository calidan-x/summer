import { request } from '@summer-js/test'

const typeVal = (value) => {
  return { type: typeof value, value }
}

const testRequestParam = async (requestValue: string, resultValue: any) => {
  const response = await request.post('/request-body-value', requestValue)
  expect(response.body).toStrictEqual(typeVal(resultValue))
}

const testErrorRequestParam = async (requestValue: string, errorMessage: any) => {
  const response = await request.post('/request-body-value', requestValue)
  if (response.statusCode === 500) {
    response.print()
  }
  expect(response.rawBody).toContain(errorMessage)
}

describe('Controller Object Convert Test', () => {
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
        eyeColor: 'Brown',
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
        gender: 'Male'
      }
    )
  })
})

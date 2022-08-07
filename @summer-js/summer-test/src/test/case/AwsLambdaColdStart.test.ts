import { initTest, endTest } from '@summer-js/test'

describe('Test AWB Lambda', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should AWB Lambda work', async () => {
    process.env.AWS_LAMBDA_FUNCTION_VERSION = '1'

    await import('../../index').then(async (module) => {
      let result = await module.handler({
        path: '/serverless/inject',
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: ''
      })

      expect(result.body).toBe('Test Injection')

      result = await module.handler({
        path: '/serverless/hello',
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: ''
      })

      expect(result.body).toBe('Hello Serverless')

      result = await module.handler({
        path: '/serverless/db-data',
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: ''
      })

      expect(result.statusCode).toBe(200)
    })
  })
})

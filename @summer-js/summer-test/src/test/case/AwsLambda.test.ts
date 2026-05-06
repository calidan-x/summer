import '@summer-js/test'

describe('Test AWB Lambda', () => {
  test('should AWB Lambda work', async () => {
    process.env.AWS_LAMBDA_FUNCTION_VERSION = '1'
    const { handler } = require('../../index')

    let result = await handler({
      path: '/serverless/hello',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: {},
      body: ''
    })

    expect(result!.body).toBe('Hello Serverless')

    result = await handler({
      path: '/serverless/inject',
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: {},
      body: ''
    })

    expect(result!.body).toBe('Test Injection')
  })
})

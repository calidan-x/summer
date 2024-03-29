import '@summer-js/test'

describe('Test AWB Lambda', () => {
  test('should AWB Lambda work', async () => {
    process.env.AWS_LAMBDA_FUNCTION_VERSION = '1'
    await import('../../index').then(async (module) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('')
        }, 200)
      })

      let result = await module.handler({
        path: '/serverless/hello',
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: ''
      })

      expect(result!.body).toBe('Hello Serverless')

      result = await module.handler({
        path: '/serverless/inject',
        httpMethod: 'GET',
        headers: {},
        queryStringParameters: {},
        body: ''
      })

      expect(result!.body).toBe('Test Injection')
    })
  })
})

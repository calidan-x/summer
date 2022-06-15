import { initTest, endTest } from '@summer-js/test'
import { Readable } from 'stream'

describe('Test Ali FC', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should Ali FC work', async () => {
    process.env.FC_FUNC_CODE_PATH = '1'
    await import('../../index').then(async (module) => {
      let statusCode = 0
      let resBody = ''
      const resp = {
        setStatusCode(code) {
          statusCode = code
        },
        setHeader() {},
        send(body) {
          resBody = body
        }
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('')
        }, 200)
      })

      const result = await module.handler(
        {
          body: Readable.from(Buffer.from('', 'base64')),
          path: '/serverless/hello',
          method: 'GET',
          headers: {},
          queries: {}
        },
        resp
      )
      expect(statusCode).toBe(200)
      expect(resBody).toBe('Hello Serverless')
    })

    await import('../../index').then(async (module) => {
      let statusCode = 0
      let resBody = ''
      const resp = {
        setStatusCode(code) {
          statusCode = code
        },
        setHeader() {},
        send(body) {
          resBody = body
        }
      }
      const result = await module.handler(
        {
          body: Readable.from(Buffer.from('', 'base64')),
          path: '/serverless/hello',
          method: 'GET',
          headers: {},
          queries: {}
        },
        resp
      )
      expect(statusCode).toBe(200)
      expect(resBody).toBe('Hello Serverless')
    })
  })
})

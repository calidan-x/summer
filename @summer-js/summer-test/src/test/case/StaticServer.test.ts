import { handleStaticRequest } from '@summer-js/summer/lib/static-server'
import { initTest, endTest, request } from '@summer-js/test'

describe('Config Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test static server', async () => {
    let result = handleStaticRequest('/static/static.txt')
    expect(result.filePath).toEqual('./resource/static.txt')

    result = handleStaticRequest('/404.txt')
    expect(result).toEqual(null)

    result = handleStaticRequest('/static/404.txt')
    expect(result.code).toEqual(404)

    result = handleStaticRequest('/static')
    expect(result.code).toEqual(301)
    expect(result.headers).toStrictEqual({ Location: '/static/', 'Cache-Control': 'no-store' })

    result = handleStaticRequest('/static/')
    expect(result.code).toEqual(200)
    expect(result.filePath).toEqual('./resource/index.html')

    result = handleStaticRequest('/static/../src/index.ts')
    expect(result).toEqual(null)
  })
})

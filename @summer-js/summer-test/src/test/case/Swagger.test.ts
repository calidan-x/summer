import { getConfig } from '@summer-js/summer'
import { initTest, endTest, request } from '@summer-js/test'
import { data } from '../data/SwaggerData'

describe('Swagger Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test swagger doc', async () => {
    const config = getConfig()
    const result = await request.get(
      (config.SERVER_CONFIG.basePath || '') + config.SWAGGER_CONFIG.docPath + '/swagger-docs.json'
    )
    expect(result.body).toStrictEqual(data)
  })
})

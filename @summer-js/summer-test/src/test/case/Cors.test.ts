import { initTest, endTest, request } from '@summer-js/test'

describe('Config Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('cors test path exist', async () => {
    let result = await request.options('/cors')
    expect(result.statusCode).toBe(200)
  })

  test('cors test path not exist', async () => {
    let result = await request.options('/cors-not-exist')
    expect(result.statusCode).toBe(404)
  })
})

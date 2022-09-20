import { initTest, endTest, request } from '@summer-js/test'

describe('Test AppController', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should response hello', async () => {
    const response = await request.get('/')
    expect(response.rawBody).toBe('Hello Summer!')
  })
})

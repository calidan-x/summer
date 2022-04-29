import { initTest, endTest, request } from '@summer-js/test'

describe('Config Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test middleware', async () => {
    let result = await request.get('/middleware')
    expect(result.body).toEqual('Middleware works')
  })
})

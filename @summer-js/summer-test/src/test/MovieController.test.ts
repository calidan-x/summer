import { initTest, endTest, request } from '@summer-js/test'

describe('Test Movie Controller', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return movie list', async () => {
    const response = await request.get('/movies')
    expect(response.statusCode).toEqual(200)
    expect(response.body).toContain('')
  })
})

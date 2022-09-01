import { initTest, endTest, Request } from '@summer-js/test'

describe('Test Movie Controller', () => {
  // init header
  // highlight-next-line
  const request = new Request({ headers: { Authorization: 'Bearer xxxxxxxxxxxx' } })

  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return movie list', async () => {
    const response = await request.get('/movies')
    expect(response.statusCode).toEqual(200)

    // change header
    // highlight-next-line
    request.setHeaders({ Authorization: 'Bearer xxxxxxxxxxxx' })
  })
})

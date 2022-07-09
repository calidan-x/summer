import { initTest, endTest, request } from '@summer-js/test'

describe('Test Loc', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should @PostConstruct works', async () => {
    const res = await request.get('/loc')
    expect(res.body).toBe('init called')
  })
})

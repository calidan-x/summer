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
    expect(res.body).toBe('init post construct')
  })

  test('should service injection works', async () => {
    const res = await request.get('/loc/service-injection')
    expect(res.body).toBe('Hi from TestService')
  })

  test('should middleware injection works', async () => {
    const res = await request.get('/middleware-injection')
    expect(res.body).toBe('Hi from TestService')
  })
})

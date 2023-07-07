import { request } from '@summer-js/test'

describe('Test Loc', () => {
  test('should @PostConstruct works', async () => {
    const res = await request.get('/ioc')
    expect(res.body).toBe('init post construct')
  })

  test('should service injection works', async () => {
    const res = await request.get('/ioc/service-injection')
    expect(res.body).toBe('Hi from TestService')
  })

  test('should middleware injection works', async () => {
    const res = await request.get('/middleware-injection')
    expect(res.body).toBe('Hi from TestService')
  })
})

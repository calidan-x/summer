import { request } from '@summer-js/test'

describe('Test Redis', () => {
  test('should set/get redis data', async () => {
    let res = await request.get('/redis/set')
    expect(res.statusCode).toBe(200)
    res = await request.get('/redis/get')
    expect(res.body).toBe('1')
  })
})

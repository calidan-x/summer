import { initTest, endTest, request } from '@summer-js/test'

describe('Test gzip response', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return uncompressed data', async () => {
    const res = await request.get('/text1')
    expect(res.headers['Content-Encoding']).toBe(undefined)
  })

  test('should return compressed data', async () => {
    const res = await request.get('/text2')
    res.print()
    expect(res.headers['Content-Encoding']).toBe('gzip')
    expect(res.body.length).toBe(3956)
  })
})

import { request } from '@summer-js/test'

describe('Test gzip response', () => {
  test('should return uncompressed data', async () => {
    const res = await request.get('/text1')
    expect(res.headers['Content-Encoding']).toBe(undefined)
  })

  test('should return compressed data', async () => {
    const res = await request.get('/text2')
    expect(res.headers['Content-Encoding']).toBe('gzip')
    expect(res.body.length).toBe(3956)
  })
})

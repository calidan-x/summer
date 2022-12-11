import { request } from '@summer-js/test'

describe('ResponseHeader Test', () => {
  test('test string return', async () => {
    let result = await request.get('/res-headers/string-return')
    expect(result.body).toEqual('string')
    expect(result.headers['Content-Type']).toBe('text/html; charset=utf-8')
  })

  test('test object return', async () => {
    let result = await request.get('/res-headers/object-return')
    expect(result.body).toStrictEqual({ a: 'a', b: 'b' })
    expect(result.headers['Content-Type']).toBe('application/json; charset=utf-8')
  })

  test('test modify header', async () => {
    let result = await request.get('/res-headers/modify-return')
    expect(result.body).toStrictEqual({ a: 'a', b: 'b' })
    expect(result.headers['Content-Type']).toBe('text/plain')
  })
})

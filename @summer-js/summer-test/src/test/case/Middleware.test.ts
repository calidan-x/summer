import { request } from '@summer-js/test'

describe('Config Test', () => {
  test('test middleware string return', async () => {
    let result = await request.get('/middleware')
    expect(result.body).toEqual('middleware works')
    expect(result.headers['Content-Type']).toBe('text/html; charset=utf-8')
  })

  test('test middleware object return', async () => {
    let result = await request.get('/middleware-object')
    expect(result.body).toStrictEqual({ msg: 'middleware works' })
    expect(result.headers['Content-Type']).toBe('application/json; charset=utf-8')
  })
})

import { request } from '@summer-js/test'
import { session } from '@summer-js/summer/lib/session'

describe('Build-In Decorator Test', () => {
  test('test @Get', async () => {
    const result = await request.get('/build-in-decorator/get')
    expect(result.body).toEqual('Get Done')
  })

  test('test @Post', async () => {
    const result = await request.post('/build-in-decorator/post')
    expect(result.body).toEqual('Post Done')
  })

  test('test @Put', async () => {
    const result = await request.put('/build-in-decorator/put')
    expect(result.body).toEqual('Put Done')
  })

  test('test @Patch', async () => {
    const result = await request.patch('/build-in-decorator/patch')
    expect(result.body).toEqual('Patch Done')
  })

  test('test @Delete', async () => {
    const result = await request.delete('/build-in-decorator/delete')
    expect(result.body).toEqual('Delete Done')
  })

  test('test @Request', async () => {
    let result = await request.get('/build-in-decorator/request')
    expect(result.body).toEqual('Request Done')
    result = await request.post('/build-in-decorator/request')
    expect(result.body).toEqual('Request Done')
    result = await request.put('/build-in-decorator/request')
    expect(result.body).toEqual('Request Done')
    result = await request.delete('/build-in-decorator/request')
    expect(result.body).toEqual('Request Done')
  })

  test('test @PathParam', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/path-param/' + randomNumber)
    expect(result.body).toEqual('PathParam' + randomNumber)
  })

  test('test @PathParam', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/path-param2/' + randomNumber)
    expect(result.body).toEqual('PathParam' + randomNumber)
  })

  test('test @Header', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/header', {}, { headers: { id: randomNumber } })
    expect(result.body).toEqual('Header' + randomNumber)
  })

  test('test @Header', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/header2', {}, { headers: { Id: randomNumber } })
    expect(result.body).toEqual('Header' + randomNumber)
  })

  test('test @Query', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/query', { id: randomNumber })
    expect(result.body).toEqual('Query' + randomNumber)
  })

  test('test @Query', async () => {
    const randomNumber = Math.ceil(Math.random() * 1000)
    const result = await request.get('/build-in-decorator/query2?Id=' + randomNumber)
    expect(result.body).toEqual('Query' + randomNumber)
  })

  test('test @Query default value', async () => {
    let result = await request.get('/build-in-decorator/query3')
    expect(result.body).toEqual('Query100')

    const randomNumber = Math.ceil(Math.random() * 1000)
    result = await request.get('/build-in-decorator/query3?Id=' + randomNumber)
    expect(result.body).toEqual('Query' + randomNumber)

    result = await request.get('/build-in-decorator/query3?Id=aaa')
    expect(result.statusCode).toBe(400)
  })

  test('test @Queries', async () => {
    const result = await request.get('/build-in-decorator/queries?id=123&name=Kate')
    expect(result.body).toEqual('Query' + JSON.stringify({ id: '123', name: 'Kate' }))
  })

  test('test @Body', async () => {
    const result = await request.post('/build-in-decorator/body', 'hello')
    expect(result.body).toEqual('Bodyhello')
  })

  test('test @Ctx', async () => {
    const result = await request.get('/build-in-decorator/ctx')
    expect(result.body).toEqual('Ctx/build-in-decorator/ctx')
  })

  test('test @RequestPath', async () => {
    const result = await request.get('/build-in-decorator/request-path')
    expect(result.body).toEqual('RequestPath/build-in-decorator/request-path')
  })

  test('test @Cookie', async () => {
    const result = await request.get(
      '/build-in-decorator/cookie',
      {},
      {
        headers: { cookie: 'id=a3fWa;' }
      }
    )
    expect(result.body).toEqual('Cookiea3fWa')
  })

  test('test @Cookie', async () => {
    const result = await request.get(
      '/build-in-decorator/cookie2',
      {},
      {
        headers: { cookie: 'Id=a3fWa;' }
      }
    )
    expect(result.body).toEqual('Cookiea3fWa')
  })

  test('test Cookie Session', async () => {
    const r = await request.post('/build-in-decorator/session')
    let res = await request.get(
      '/build-in-decorator/session',
      {},
      { headers: { cookie: r.headers['Set-Cookie'][0].replace('HttpOnly', '') } }
    )
    expect(res.body).toEqual('Session100')

    res = await request.get(
      '/build-in-decorator/session-all',
      {},
      { headers: { cookie: r.headers['Set-Cookie'][0].replace('HttpOnly', '') } }
    )
    expect(res.body).toStrictEqual({ id: 100 })
  })

  test('test Header Session', async () => {
    session.mode = 'Header'

    const r = await request.post('/build-in-decorator/session')
    let res = await request.get(
      '/build-in-decorator/session',
      {},
      { headers: { SUMMER_SESSION: r.headers['SUMMER_SESSION'] } }
    )
    expect(res.body).toEqual('Session100')

    res = await request.get(
      '/build-in-decorator/session-all',
      {},
      { headers: { SUMMER_SESSION: r.headers['SUMMER_SESSION'] } }
    )
    expect(res.body).toStrictEqual({ id: 100 })
  })
})

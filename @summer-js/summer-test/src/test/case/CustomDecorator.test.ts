import { initTest, endTest, request } from '@summer-js/test'
import jwt from 'jsonwebtoken'

describe('Config Test', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test createParamDecorator', async () => {
    const result = await request.get('/app/version', { headers: { 'app-version': '1.0.0' } })
    expect(result.statusCode).toBe(200)
    expect(result.body).toBe('1.0.0')
  })

  test('test createMethodDecorator', async () => {
    let result = await request.get('/cache/1')
    expect(result.statusCode).toBe(200)
    let firstResult = result.body
    result = await request.get('/cache/1')
    expect(result.body).toBe(firstResult)

    result = await request.get('/cache2/2')
    expect(result.statusCode).toBe(200)
    firstResult = result.body
    result = await request.get('/cache2/2')
    expect(result.body).toBe(firstResult)
  })

  test('test createPropertyDecorator', async () => {
    let result = await request.get('/cities')
    expect(result.body).toStrictEqual(['Shanghai', 'Tokyo', 'New York City'])

    result = await request.get('/mysql-host')
    expect(result.body).toBe('localhost')
  })

  test('test download', async () => {
    let result = await request.get('/download')
    expect(result.body).toBe('Hello Summer')
    expect(result.headers['Content-Type']).toBe('application/octet-stream')
    expect(result.headers['Content-Disposition']).toBe(`attachment; filename="hello.txt"`)
  })

  test('test auth', async () => {
    let result = await request.get('/userinfo')
    expect(result.body).toBe('')

    var token = jwt.sign({ uid: 1, name: 'Tom' }, 'xxxxxxxx')
    result = await request.get('/userinfo', { headers: { authentication: token } })
    expect(result.body).toBe('1')

    result = await request.get('/me')
    expect(result.statusCode).toBe(401)

    result = await request.put('/me', { headers: { authentication: token } })
    expect(result.statusCode).toBe(200)
  })

  test('test response code', async () => {
    let result = await request.get('/dog')
    expect(result.statusCode).toBe(404)
  })
})

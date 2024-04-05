import { request } from '@summer-js/test'

describe('Config Test', () => {
  test('cors test path options', async () => {
    let result = await request.options('/cors')
    expect(result.statusCode).toBe(200)
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*')
    expect(result.headers['Access-Control-Allow-Methods']).toBe('GET,POST,PUT,DELETE,PATCH,OPTIONS')
    expect(result.headers['Access-Control-Allow-Headers']).toBe('*')
    expect(result.headers['Access-Control-Allow-Credentials']).toBe('true')
  })

  test('cors test path method', async () => {
    let result = await request.get('/cors')
    expect(result.statusCode).toBe(200)
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*')
    expect(result.headers['Access-Control-Allow-Methods']).toBe('GET,POST,PUT,DELETE,PATCH,OPTIONS')
    expect(result.headers['Access-Control-Allow-Headers']).toBe('*')
    expect(result.headers['Access-Control-Allow-Credentials']).toBe('true')
  })

  test('cors test options origin', async () => {
    let result = await request.options('/cors', { headers: { origin: 'https://example.com' } })
    expect(result.statusCode).toBe(200)
    expect(result.headers['Access-Control-Allow-Origin']).toBe('https://example.com')
  })

  test('cors test method origin', async () => {
    let result = await request.get('/cors', {}, { headers: { origin: 'https://example.com' } })
    expect(result.statusCode).toBe(200)
    expect(result.headers['Access-Control-Allow-Origin']).toBe('https://example.com')
  })

  test('chrome preflight request header', async () => {
    let result = await request.get(
      '/cors',
      {},
      { headers: { origin: 'https://example.com', 'access-control-request-headers': 'content-type' } }
    )
    expect(result.statusCode).toBe(200)
    expect(result.headers['Access-Control-Allow-Origin']).toBe('https://example.com')
    expect(result.headers['Access-Control-Allow-Headers']).toBe('content-type')
  })

  test('cors test path not exist', async () => {
    let result = await request.options('/cors-not-exist')
    expect(result.statusCode).toBe(200)
  })
})

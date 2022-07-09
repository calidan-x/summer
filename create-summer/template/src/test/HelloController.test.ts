import { initTest, endTest, request } from '@summer-js/test'

describe('Test HelloController', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should response hello', async () => {
    const response = await request.get('/')
    expect(response.body).toBe('Hello Summer!')
  })

  test('should response hello from service', async () => {
    const response = await request.get('/service-inject')
    expect(response.body).toBe('Hello')
  })

  test('should response hello from import service', async () => {
    const response = await request.get('/import-inject-test')
    expect(response.body).toBe('info')
  })
})

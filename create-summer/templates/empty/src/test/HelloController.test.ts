import { request } from '@summer-js/test'

describe('Test HelloController', () => {
  test('should response hello', async () => {
    const response = await request.get('/')
    expect(response.body).toBe('Hello Summer!')
  })

  test('should response hi', async () => {
    const response = await request.get('/hi')
    expect(response.body).toBe('Hi Summer!')
  })
})

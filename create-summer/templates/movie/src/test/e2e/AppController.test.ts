import { request } from '@summer-js/test'

describe('Test AppController', () => {
  test('should response hello', async () => {
    const response = await request.get('/')
    expect(response.rawBody).toBe('Hello Summer!')
  })
})

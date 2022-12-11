import { request } from '@summer-js/test'

describe('Test ControllerPath', () => {
  test('should response hello v2', async () => {
    const response = await request.get('/v2/hello')
    expect(response.rawBody).toBe('Hello Summer!')
    expect(response.body).toBe('Hello Summer!')
  })
})

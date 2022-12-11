import { request } from '@summer-js/test'

describe('Test Movie Controller', () => {
  test('should return movie list', async () => {
    const response = await request.get('/movies')
    expect(response.statusCode).toEqual(200)
  })
})

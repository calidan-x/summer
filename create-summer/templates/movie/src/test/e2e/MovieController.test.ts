import { initTest, endTest, request } from '@summer-js/test'
import { getDataSource } from '@summer-js/typeorm'

import { Movie } from '../../entity/Movie'

describe('Test MovieController', () => {
  beforeAll(async () => {
    await initTest()
    // clear all movies at the beginning
    await getDataSource('MOVIE_DB').getRepository(Movie).clear()
  })

  afterAll(async () => {
    await endTest()
  })

  test('test add movie', async () => {
    const response = await request.post('/v1/movies', { body: { name: 'Titanic', year: '1997' } })
    expect(response.statusCode).toBe(200)
  })

  test('test get movie', async () => {
    const response = await request.get('/v1/movies/1')
    expect(response.body).toEqual({ id: 1, name: 'Titanic', year: '1997' })
  })
})

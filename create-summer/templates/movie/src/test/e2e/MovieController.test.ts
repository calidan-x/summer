import { request } from '@summer-js/test'
import { getDataSource } from '@summer-js/typeorm'

import { Movie } from '../../entity/Movie'

describe('Test MovieController', () => {
  beforeAll(async () => {
    // clear all movies at the beginning
    await getDataSource('MOVIE_DB').getRepository(Movie).clear()
  })

  test('test add movie', async () => {
    const response = await request.post('/v1/movies', { name: 'Titanic', year: '1997' })
    expect(response.statusCode).toBe(200)
  })

  test('test get movie', async () => {
    const response = await request.get('/v1/movies/1')
    expect(response.body).toStrictEqual({ id: 1, name: 'Titanic', year: '1997' })
  })
})

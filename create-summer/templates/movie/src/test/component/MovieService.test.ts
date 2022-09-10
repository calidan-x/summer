import { getInjectable } from '@summer-js/summer'
import { initTest, endTest } from '@summer-js/test'
import { Movie } from '../../entity/Movie'
import { MovieService } from '../../service/MovieService'

describe('Test MovieService', () => {
  let movieService: MovieService

  beforeAll(async () => {
    await initTest()
    movieService = getInjectable(MovieService)
  })

  afterAll(async () => {
    await endTest()
  })

  test('should get movie detail', async () => {
    const testMovie: Movie = { id: 1, name: 'The Godfather', year: '1972' }
    movieService.movieRepository.findOneBy = jest.fn().mockReturnValue(Promise.resolve(testMovie))
    expect(await movieService.getMovie(1)).toStrictEqual(testMovie)
  })
})

import { convertData, Service } from '@summer-js/summer'
import { Repository } from '@summer-js/typeorm'

import { MovieRequest } from '../dto/request/movie'
import { Movie } from '../entity/Movie'
import { ResError } from '../error'

@Service
export class MovieService {
  movieRepository: Repository<Movie>

  async addMovie(addMovieRequest: MovieRequest) {
    const movie = convertData(addMovieRequest, Movie)
    return await this.movieRepository.save(movie)
  }

  async getMovies(pageNumber: number, pageSize: number) {
    const [movies, total] = await this.movieRepository.findAndCount({
      take: pageSize,
      skip: (pageNumber - 1) * pageSize
    })
    return { movies, total }
  }

  async getMovie(id: number) {
    const movie = await this.movieRepository.findOneBy({ id })
    if (!movie) {
      throw ResError.MOVIE_NOT_FOUND
    }
    return movie
  }

  async updateMovie(id, movieReq: MovieRequest) {
    const movie = convertData(movieReq, Movie)
    movie.id = id
    return await this.movieRepository.save(movie)
  }

  async deleteMovie(id: number) {
    return await this.movieRepository.delete({ id })
  }
}

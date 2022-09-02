import { Controller, Get, Post, Put, Delete, PathParam, Body, Query } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

import { Paging } from '../dto/Paging'
import { MovieRequest } from '../dto/request/movie'
import { ResError } from '../error'
import { MovieService } from '../service/MovieService'

@Controller('/v1/movies')
@ApiDocGroup('Movie APIs')
export class MovieController {
  movieService: MovieService

  @Get
  @ApiDoc('fetch movie list')
  async list(@Query pageNumber: int, @Query pageSize: int) {
    const { movies, total } = await this.movieService.getMovies(pageNumber, pageSize)
    return new Paging({ data: movies, total, pageNumber, pageSize })
  }

  @Get('/:id')
  @ApiDoc('get a movie detail', {
    errors: [ResError.MOVIE_NOT_FOUND, ResError.FETCH_MOVIE_LIST_FAIL]
  })
  async detail(@PathParam id: int) {
    return await this.movieService.getMovie(id)
  }

  @Post
  @ApiDoc('add a new movie', { security: [{ AppAuth: [] }] })
  async add(@Body req: MovieRequest) {
    return await this.movieService.addMovie(req)
  }

  @Put('/:id')
  @ApiDoc('update a movie')
  async update(@PathParam id: int, @Body req: MovieRequest) {
    return await this.movieService.updateMovie(id, req)
  }

  @Delete('/:id')
  @ApiDoc('delete a movie', { deprecated: true })
  async delete(@PathParam id: int) {
    await this.movieService.deleteMovie(id)
  }

  @Delete('^/v2/movies/:id')
  @ApiDoc('delete a movie')
  async deleteV2(@PathParam id: int) {
    await this.movieService.deleteMovie(id)
  }
}

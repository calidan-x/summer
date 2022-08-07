import { Body, Controller, Get, Query, PathParam, Post } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup, PropDoc } from '@summer-js/swagger'

class AddMovieRequest {
  name: string
  year: string
}

export class Movie {
  id: number

  @PropDoc('Name of the movie', '2022')
  name: string

  @PropDoc('Movie Release Year', '2022')
  year: string
}

@Controller
@ApiDocGroup('Movie Apis')
export class MovieController {
  @ApiDoc('Get movies')
  @Get('/movies')
  list(@Query search?: string) {
    const movies: Movie[] = [
      { id: 1, name: 'Titanic', year: '1997' },
      { id: 2, name: 'CODA', year: '2021' }
    ]
    return movies
  }

  @ApiDoc('Get movie detail')
  @Get('/movies/:id')
  detail(@PathParam id: string) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }

  @ApiDoc('Add new movie')
  @Post('/movies')
  add(@Body body: AddMovieRequest) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }
}

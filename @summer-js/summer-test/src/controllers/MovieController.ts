import { Body, Controller, Get, Query, PathParam, Post } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class AddMovieRequest {
  name: string
  year: string
}

class Movie {
  id: number
  name: string
  year: string
}

@Controller
@ApiDocGroup('电影相关接口')
export class MovieController {
  @ApiDoc('获取电影列表')
  @Get('/movies')
  list(@Query search: string) {
    const movies: Movie[] = [
      { id: 1, name: 'Titanic', year: '1997' },
      { id: 2, name: 'CODA', year: '2021' }
    ]
    return movies
  }

  @ApiDoc('获取电影详情')
  @Get('/movies/:id')
  detail(@PathParam id: string) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }

  @ApiDoc('新增电影')
  @Post('/movies')
  add(@Body body: AddMovieRequest) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }
}

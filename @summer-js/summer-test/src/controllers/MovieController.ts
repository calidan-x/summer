import { Body, Controller, Get, Query, PathParam, Header, Post } from '@summer-js/summer'
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
@ApiDocGroup('电影相关接口', { category: '电影' })
export class MovieController {
  @ApiDoc('获取电影列表', {
    description: '获取电影描述',
    example: {
      response: [
        { id: 1, name: 'Titanic', year: '1997' },
        { id: 2, name: 'CODA', year: '2021' }
      ]
    }
  })
  @Get('/movies')
  list(@Query search: string) {
    const movies: Movie[] = [
      { id: 1, name: 'Titanic', year: '1997' },
      { id: 2, name: 'CODA', year: '2021' }
    ]
    return movies
  }

  @ApiDoc('获取电影', {
    description: '获取电影描述2',
    example: {
      response: { id: 1, name: 'Titanic', year: '1997' }
    },
    errors: { 404: 'Not Found' }
  })
  @Get('/movies/:id')
  detail(@PathParam id: string) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }

  @ApiDoc('测试文档', {
    description: '描述描述描述描述描述',
    example: {
      request: { name: 'Titanic', year: '1997' },
      response: { id: 1, name: 'Titanic', year: '1997' }
    }
  })
  @Post('/movies')
  add(@Body body: AddMovieRequest) {
    const movies: Movie = { id: 1, name: 'Titanic', year: '1997' }
    return movies
  }
}

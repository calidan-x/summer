import { Body, Controller, Get, Query, PathParam, Header, Post } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class AddMovieRequest {
  name: string
  year: string
}

@Controller('/swagger-test')
@ApiDocGroup('相关服务')
export class SwaggerController {
  @Get()
  @ApiDoc('获取Hello', { description: '描述描述描述描述描述' })
  hello() {
    return 'Hello Summer!'
  }

  @ApiDoc('测试文档', {
    description: '描述描述描述描述描述',
    errors: {
      404: { code: 123123, msg: 'not found' }
    }
  })
  @Post('/swagger')
  paramDoc(@Body body: AddMovieRequest, @Query query: string, @PathParam id: int, @Header header) {
    // add todo
  }
}

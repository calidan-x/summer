import { Controller, Get, Validate, Body, Post, getInjectable } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class CustomValidateRequest {
  val: int
  @Validate((val: string) => {
    return val.indexOf(',') > 0
  })
  value: string
}

class Book {
  name: string
}

@Controller
@ApiDocGroup('欢迎相关接口')
export class HelloController {
  @Get
  @ApiDoc('获取Hello', { description: '描述描述描述描述描述', example: { response: 'Hello Summer!' } })
  hello() {
    return 'Hello Summer!'
  }

  @Get('/b')
  @ApiDoc('获取Book')
  async hello2() {
    const book = new Book()
    book.name = 'Test book'
    return book
  }

  @Post
  phello(@Body body: CustomValidateRequest) {
    return body
  }

  @Post('/sss')
  p2hello(@Body body) {
    console.log(typeof body)
    return body
  }
}

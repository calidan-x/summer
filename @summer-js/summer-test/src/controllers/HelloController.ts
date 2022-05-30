import { Controller, Get, Validate, Body, Post, getInjectable } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'
import { getBook2, getBook } from './Book'

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
  hello2() {
    const book = getBook2()
    return book
  }

  @Post('/sss')
  p2hello(@Body body) {
    console.log(typeof body)
    return body
  }
}

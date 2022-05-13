import { Controller, Get, Validate, Body, Post } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class CustomValidateRequest {
  val: int
  @Validate((val: string) => {
    return val.indexOf(',') > 0
  })
  value: string
}

@Controller
@ApiDocGroup('欢迎相关接口')
export class HelloController {
  @Get
  @ApiDoc('获取Hello', { description: '描述描述描述描述描述', example: { response: 'Hello Summer!' } })
  hello() {
    return 'Hello Summer!'
  }

  @Post
  phello(@Body body: CustomValidateRequest) {
    return body
  }

  @Post('/sss')
  p2hello(@Body body: 'Good') {
    return body
  }
}

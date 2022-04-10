import { Controller, Get } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

@Controller
@ApiDocGroup('欢迎相关接口')
export class HelloController {
  @Get
  @ApiDoc('获取Hello', { description: '描述描述描述描述描述', example: { response: 'Hello Summer!' } })
  hello() {
    return 'Hello Summer'
  }
}

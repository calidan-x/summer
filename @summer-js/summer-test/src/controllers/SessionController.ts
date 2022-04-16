import { Controller, Get, Session } from '@summer-js/summer'
import { ApiDoc } from '@summer-js/swagger'

@Controller('session')
export class SessionController {
  @Get()
  @ApiDoc('获取Hello', { description: '描述描述描述描述描述' })
  session(@Session session: any) {
    return session
  }
}

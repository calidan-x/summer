import { Controller, Get, Session } from '@summer-js/summer'
import { ApiDoc } from '@summer-js/swagger'

@Controller('/session')
export class SessionController {
  @Get()
  session(@Session session: any) {
    return session
  }
}

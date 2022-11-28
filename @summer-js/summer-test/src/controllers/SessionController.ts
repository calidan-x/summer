import { Controller, Get, Session } from '@summer-js/summer'

@Controller('/session')
export class SessionController {
  @Get()
  session(@Session session: any) {
    return session
  }
}

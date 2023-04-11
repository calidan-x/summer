import { Controller, Get, Session } from '@summer-js/summer'

@Controller('/session')
export class SessionController {
  @Get()
  session() {
    return Session.get('session')!
  }
}

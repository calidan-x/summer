import { Controller, Get, setCookie, clearCookie } from '@summer-js/summer'

@Controller('/serverless')
export class ServerlessController {
  @Get('/hello')
  serverless() {
    return 'Hello Serverless'
  }
}

import { Controller, Get, Cookie } from '@summer-js/summer'

@Controller('/cookie')
export class CookieTestController {
  @Get('/set')
  set() {
    Cookie.set('TestCookie', 'Value')
    Cookie.set('TestCookie2', 'Value2')
  }

  @Get('/clear')
  clear() {
    Cookie.clear('TestCookie')
  }
}

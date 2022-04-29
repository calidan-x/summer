import { Controller, Get, setCookie, clearCookie } from '@summer-js/summer'

@Controller('/cookie')
export class CookieTestController {
  @Get('/set')
  set() {
    setCookie({ name: 'TestCookie', value: 'Value' })
    setCookie({ name: 'TestCookie2', value: 'Value2' })
  }

  @Get('/clear')
  clear() {
    clearCookie('TestCookie')
  }
}

import { Controller, Post, Body, setCookie, clearCookie } from '@summer-js/summer'

@Controller
export class CookieController {
  @Post('/cookie')
  add() {
    setCookie({ name: 'my-cookie', value: 'val', httpOnly: true })
  }
}

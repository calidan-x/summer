import { Controller, Post, setCookie } from '@summer-js/summer'

@Controller
export class CookieController {
  @Post('/cookie')
  add() {
    setCookie({ name: 'my-cookie', value: 'val', httpOnly: true })
  }
}

import { Controller, Post, Cookie } from '@summer-js/summer'

@Controller
export class CookieController {
  @Post('/cookie')
  add() {
    Cookie.set('my-cookie', 'val', { httpOnly: true })
  }
}

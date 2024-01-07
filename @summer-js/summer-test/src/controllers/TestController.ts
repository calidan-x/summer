import { Body, Controller, Post } from '@summer-js/summer'

export class DD {
  d: Date
}

@Controller
export class TestController {
  @Post
  test(@Body dd: DD) {
    console.log(typeof dd.d)
    return dd
  }
}

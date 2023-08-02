import { Controller, Get, Queries } from '@summer-js/summer'

class B {
  a: number
  b: number
}

export class DD {
  ids: number[]
  a: B
}

@Controller
export class TestController {
  @Get
  test(@Queries ids: DD) {
    console.log(ids)
    return ids
  }
}

import { Controller, Get } from '@summer-js/summer'
import { sum } from '../js/index'

@Controller
export class JsController {
  @Get('/js-test')
  add() {
    return sum(2, 2)
  }
}

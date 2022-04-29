import { Controller, Get } from '@summer-js/summer'

@Controller('/cors')
export class CorsTestController {
  @Get
  cors() {
    return ''
  }
}

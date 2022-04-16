import { Controller, Get } from '@summer-js/summer'

@Controller('/base-path')
export class BasePathController {
  @Get('/')
  get() {
    return 'BasePath works'
  }
}

import { Controller, createParamDecorator, Get } from '@summer-js/summer'

export const AppVersion = createParamDecorator((ctx) => {
  return ctx.request.headers['app-version']
})

@Controller
export class AppVersionController {
  @Get('/app/version')
  async version(@AppVersion version) {
    return version
  }
}

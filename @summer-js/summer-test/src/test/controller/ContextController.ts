import { Controller, Get, getContext } from '@summer-js/summer'

@Controller
export class ContextController {
  @Get('/context')
  context() {
    const context = getContext()!
    // highlight-next-line
    context.response.headers['content-type'] = 'text/plain'

    // although the controller return 'Hello Summer', set context response content has a higher priority
    // highlight-next-line
    context.response.body = 'hi Summer'
    return 'hello winter'
  }
}

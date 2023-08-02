import {
  Controller,
  Delete,
  Get,
  PathParam,
  Post,
  Put,
  Patch,
  Query,
  Request,
  Queries,
  Header,
  Context,
  Body,
  RequestPath,
  Session,
  Cookie
} from '@summer-js/summer'

export class Obj {
  a: number
  b: number
}

export class Q {
  ids: number[]
  obj: Obj
}

@Controller('/build-in-decorator')
export class BuildInDecoratorTestController {
  @Get('/get')
  get() {
    return 'Get Done'
  }

  @Post('/post')
  post() {
    return 'Post Done'
  }

  @Put('/put')
  put() {
    return 'Put Done'
  }

  @Patch('/patch')
  patch() {
    return 'Patch Done'
  }

  @Delete('/delete')
  delete() {
    return 'Delete Done'
  }

  @Request('/request')
  request() {
    return 'Request Done'
  }

  @Get('/path-param/:id')
  pathParam(@PathParam id: number) {
    return 'PathParam' + id
  }

  @Get('/path-param2/:Id')
  pathParam2(@PathParam('Id') id: number) {
    return 'PathParam' + id
  }

  @Get('/query')
  query(@Query id: number) {
    return 'Query' + id
  }

  @Get('/query2')
  query2(@Query('Id') id: number) {
    return 'Query' + id
  }

  @Get('/query3')
  query3(@Query('Id') id = 100) {
    return 'Query' + id
  }

  @Get('/queries')
  queries(@Queries queries: Q) {
    return 'Query' + JSON.stringify(queries)
  }

  @Get('/header')
  header(@Header id: string) {
    return 'Header' + id
  }

  @Get('/header2')
  header2(@Header('Id') id: string) {
    return 'Header' + id
  }

  @Get('/ctx')
  ctx(@Context context: Context) {
    return 'Ctx' + context.request.path
  }

  @Post('/body')
  body(@Body body: string) {
    return 'Body' + body
  }

  @Get('/request-path')
  requestPath(@RequestPath requestPath: string) {
    return 'RequestPath' + requestPath
  }

  @Get('/cookie')
  cookie() {
    return 'Cookie' + Cookie.get('id')!
  }

  @Get('/cookie2')
  cookie2() {
    return 'Cookie' + Cookie.get('Id')
  }

  @Post('/session')
  async addSession() {
    await Session.set('id', 100)
  }

  @Get('/session')
  async session() {
    return 'Session' + (await Session.get('id'))
  }

  @Get('/session-all')
  async sessionAll() {
    return JSON.stringify(await Session.getAll())
  }
}

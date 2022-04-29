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
  Ctx,
  Body,
  RequestPath,
  Session,
  Cookie
} from '@summer-js/summer'

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

  @Get('/queries')
  queries(@Queries queries: any) {
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
  ctx(@Ctx context: Context) {
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
  cookie(@Cookie id: string) {
    return 'Cookie' + id
  }

  @Get('/cookie2')
  cookie2(@Cookie('Id') id: string) {
    return 'Cookie' + id
  }

  @Post('/session')
  addSession(@Session session: any) {
    session.id = '100'
  }

  @Get('/session')
  session(@Session session: any) {
    return 'Session' + session.id
  }
}

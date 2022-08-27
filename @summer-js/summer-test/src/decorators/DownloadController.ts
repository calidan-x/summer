import { Controller, createMethodDecorator, Get } from '@summer-js/summer'

export const DownLoadFile = createMethodDecorator(async (ctx, invokeMethod, fileName: string) => {
  ctx.response.headers['content-type'] = 'application/octet-stream'
  ctx.response.headers['Content-Disposition'] = `attachment; filename="${fileName}"`
  return await invokeMethod(ctx.invocation.params)
})

@Controller
export class DownloadController {
  @DownLoadFile('hello.txt')
  @Get('/download')
  download() {
    return 'Hello Summer'
  }
}

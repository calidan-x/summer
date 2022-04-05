import { Controller, createMethodDecorator, Get } from '@summer-js/summer';

export const DownLoadFile = createMethodDecorator(async (ctx, invokeMethod, fileName: string) => {
  await invokeMethod();
  ctx.response.headers['Content-Type'] = 'application/octet-stream';
  ctx.response.headers['Content-Type'] = `attachment; filename="${fileName}"`;
});

@Controller
export class DownloadController {
  @DownLoadFile('hello.txt')
  @Get('/download')
  download() {
    return 'Hello Summer';
  }
}

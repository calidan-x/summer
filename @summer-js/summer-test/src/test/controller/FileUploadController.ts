import { Controller, Post, Body, File } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class Request {
  field1: string
  field2?: int
  file: File
}

@Controller('/upload')
@ApiDocGroup('上传相关接口')
export class FileUploadController {
  @ApiDoc('上传文件')
  @Post
  uploadFile(@Body req: Request) {
    console.log('body', req)
  }
}

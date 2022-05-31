import { Controller, Post, UploadedFile, Body, File } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

class Request {
  field1: string
  field2?: int
}

@Controller('/upload')
@ApiDocGroup('上传相关接口')
export class FileUploadController {
  @ApiDoc('上传文件')
  @Post
  uploadFile(@Body req: Request, @File file: UploadedFile) {
    // console.log('body', body)
    // console.log(fs.statSync(file.tmpPath))
    // return file
  }
}

import { Controller, Post, UploadedFile, Body, File } from '@summer-js/summer'
import { ApiDoc, ApiDocGroup } from '@summer-js/swagger'

@Controller('/upload')
@ApiDocGroup('欢迎相关接口')
export class FileUploadController {
  @Post
  hello(@File file: UploadedFile, @Body body) {
    console.log('body', body)
    return file
  }
}

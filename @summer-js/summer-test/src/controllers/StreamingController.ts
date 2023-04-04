import { Controller, Get, StreamData } from '@summer-js/summer'

@Controller
export class StreamingController {
  @Get('/download-streaming-file')
  async download() {
    return new StreamData('package.json')
  }
}

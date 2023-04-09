import { Controller, Get, StreamingData } from '@summer-js/summer'
import fs from 'fs'

@Controller
export class StreamingDataController {
  @Get('/play-video')
  async playVideo() {
    return new StreamingData('video.mp4')
  }

  @Get('/download-streaming-file')
  async download() {
    return new StreamingData('tmp.pdf', { downloadFileName: 'intro.pdf' })
  }

  @Get('/download-streaming-data')
  async downloadData() {
    const readStream = fs.createReadStream('report.csv')
    return new StreamingData(readStream, { downloadFileName: 'report.csv' })
  }
}

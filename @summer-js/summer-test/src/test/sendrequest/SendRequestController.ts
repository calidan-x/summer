import { SendRequestClient, SummerDevClient } from './SendRequestClient'
import { Controller, Get } from '@summer-js/summer'

@Controller
export class SendRequestController {
  sendRequestClient: SendRequestClient
  summerDevClient: SummerDevClient

  @Get('/send-request')
  async getUser() {
    return await this.sendRequestClient.getApi()
  }

  @Get('/summer-request')
  async getSummerSite() {
    return await this.summerDevClient.getHomePage()
  }
}

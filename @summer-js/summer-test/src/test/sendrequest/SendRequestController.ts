import { SendRequestClient, SummerDevClient } from './SendRequestClient'
import { Controller, Get } from '@summer-js/summer'

@Controller
export class SendRequestController {
  sendRequestClient: SendRequestClient
  summerDevClient: SummerDevClient

  @Get('/send-request')
  async getUser() {
    try {
      return await this.sendRequestClient.getApi()
    } catch (e) {
      console.log(e)
    }
    return null
  }

  @Get('/summer-request')
  async getSummerSite() {
    try {
      return await this.summerDevClient.getHomePage()
    } catch (e) {
      console.log(e)
    }
    return null
  }
}

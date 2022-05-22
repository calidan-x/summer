import { SendRequestClient, SummerDevClient } from './SendRequestClient'
import { AutoInject, Controller, Get, Inject } from '@summer-js/summer'

@Controller
@AutoInject
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
  }

  @Get('/summer-request')
  async getSummerSite() {
    try {
      return await this.summerDevClient.getHomePage()
    } catch (e) {
      console.log(e)
    }
  }
}

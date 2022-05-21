import { SendRequestClient } from './SendRequestClient'
import { Controller, Get, Inject } from '@summer-js/summer'

@Controller
export class SendRequestController {
  @Inject
  sendRequestClient: SendRequestClient

  @Get('/send-request')
  async getUser() {
    try {
      return await this.sendRequestClient.getHomePage()
    } catch (e) {
      console.log(e)
    }
  }
}

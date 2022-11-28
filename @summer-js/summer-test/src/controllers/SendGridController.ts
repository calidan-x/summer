import { Controller, Get } from '@summer-js/summer'
import { SendGridClient } from './../client/SendGridClient'

@Controller
export class SendGridController {
  sendGridClient: SendGridClient

  @Get('/send-email')
  async send() {
    const result = await this.sendGridClient.sendEmail({
      personalizations: [{ to: [{ email: 'calidan@qq.com', name: 'Calidan' }], subject: 'Hello, World!' }],
      content: [{ type: 'text/plain', value: 'Heya!' }],
      from: { email: 'no-reply', name: 'Test' }
    })
    console.log(result)
  }
}

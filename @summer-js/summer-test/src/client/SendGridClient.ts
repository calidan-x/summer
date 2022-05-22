import { Body, createRequestClientDecorator, Send } from '@summer-js/summer'

const SendGrid = createRequestClientDecorator((config) => ({
  baseUrl: 'https://api.sendgrid.com',
  headers: {
    Authorization: 'Bearer <<API_KEY>>',
    'Content-Type': 'application/json'
  }
}))

interface SendMailData {
  personalizations: [{ to: [{ email: string; name: string }]; subject: string }]
  content: [{ type: 'text/plain'; value: string }]
  from: { email: string; name: string }
}

@SendGrid
export class SendGridClient {
  @Send('POST', '/v3/mail/send')
  sendEmail(@Body data: SendMailData) {
    return
  }
}

import { Service, createRequestDecorator, Body, Header } from '@summer-js/summer'

const Send = createRequestDecorator((config) => ({
  baseUrl: 'https://summerjs.dev'
}))

@Service()
export class SendRequestClient {
  @Send('GET', '/')
  async getHomePage(): Promise<string> {
    return
  }
}

import { Service, createRequestDecorator, Body, Header } from '@summer-js/summer'

const Send = createRequestDecorator((config) => ({
  baseUrl: 'http://127.0.0.1:8803'
}))

@Service()
export class SendRequestClient {
  @Send('GET', '/')
  async getApi(): Promise<any> {
    return
  }
}

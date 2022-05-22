import { createRequestClientDecorator, Send, Body, Header, Request } from '@summer-js/summer'

const LocalClient = createRequestClientDecorator((config) => ({
  baseUrl: 'http://127.0.0.1:8803'
}))

class User {
  id: number
  name: string
}

@LocalClient
export class SendRequestClient {
  @Send('GET', '/')
  async getApi(): Promise<User> {
    return
  }
}

const SummerDev = createRequestClientDecorator((config) => ({
  baseUrl: 'https://summerjs.dev'
}))

@SummerDev
export class SummerDevClient {
  @Send('GET', '/')
  async getHomePage(): Promise<string> {
    return
  }
}

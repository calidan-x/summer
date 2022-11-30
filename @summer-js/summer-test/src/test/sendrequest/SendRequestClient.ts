import { createRequestClientDecorator, Send } from '@summer-js/summer'

const LocalClient = createRequestClientDecorator((_config) => ({
  baseUrl: 'http://127.0.0.1:8803'
}))

export class User {
  id: number
  name: string
}

@LocalClient
export class SendRequestClient {
  @Send('GET', '/')
  async getApi(): Promise<User> {
    return null as any
  }
}

const SummerDev = createRequestClientDecorator((_config) => ({
  baseUrl: 'https://summerjs.dev'
}))

@SummerDev
export class SummerDevClient {
  @Send('GET', '/')
  async getHomePage(): Promise<string> {
    return null as any
  }
}

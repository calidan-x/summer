import { createRequestClientDecorator, PathParam, Query, Send } from '@summer-js/summer'

const App = createRequestClientDecorator((config) => ({
  baseUrl: 'http://api.example.com'
}))

@App
export class AppClient {
  @Send('GET', '/v1/books/:id')
  getBookById(@PathParam id: number) {
    return
  }

  @Send('GET', '/v1/books')
  getBooks(@Query name: string) {
    return
  }
}

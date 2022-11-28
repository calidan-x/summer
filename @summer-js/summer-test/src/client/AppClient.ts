import { createRequestClientDecorator, PathParam, Query, Send } from '@summer-js/summer'

const App = createRequestClientDecorator(() => ({
  baseUrl: 'http://api.example.com'
}))

@App
export class AppClient {
  @Send('GET', '/v1/books/:id')
  getBookById(@PathParam id: number) {
    id
    return
  }

  @Send('GET', '/v1/books')
  getBooks(@Query name: string) {
    name
    return
  }
}

import { Controller, Get } from '@summer-js/summer'
import { AppClient } from './../client/AppClient'

@Controller
export class AppController {
  appClient: AppClient

  @Get('/app-get-books-id')
  async getBookById() {
    const result = await this.appClient.getBookById(1)
    console.log(result)
  }

  @Get('/app-get-books')
  async getBook() {
    const result = await this.appClient.getBooks('name')
    console.log(result)
  }
}

import { Controller, Get, createPropertyDecorator } from '@summer-js/summer'
import { MovieController } from './MovieController'

const PropInject = createPropertyDecorator(async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Test Injection')
    }, 100)
  })
})

@Controller('/serverless')
export class ServerlessController {
  @PropInject
  prop: string

  movieController: MovieController

  @Get('/hello')
  serverless() {
    return 'Hello Serverless'
  }

  @Get('/inject')
  inject() {
    return this.prop
  }

  @Get('/db-data')
  async dbData() {
    return await this.movieController.list()
  }
}

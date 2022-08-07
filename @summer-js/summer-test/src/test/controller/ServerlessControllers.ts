import { Controller, Get, createPropertyDecorator, AutoInject } from '@summer-js/summer'
import { MovieController } from './MovieController'

const PropInject = createPropertyDecorator(async (config) => {
  return new Promise((resolve, rejected) => {
    setTimeout(() => {
      resolve('Test Injection')
    }, 100)
  })
})

@Controller('/serverless')
@AutoInject
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

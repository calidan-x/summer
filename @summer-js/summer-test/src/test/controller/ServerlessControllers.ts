import { Controller, Get, setCookie, clearCookie, createPropertyDecorator } from '@summer-js/summer'

const PropInject = createPropertyDecorator(async (config) => {
  return new Promise((resolve, rejected) => {
    setTimeout(() => {
      resolve('Test Injection')
    }, 100)
  })
})

@Controller('/serverless')
export class ServerlessController {
  @PropInject
  prop: string

  @Get('/hello')
  serverless() {
    return 'Hello Serverless'
  }

  @Get('/inject')
  inject() {
    return this.prop
  }
}

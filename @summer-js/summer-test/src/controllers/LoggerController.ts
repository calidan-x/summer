import { Controller, Get, Logger } from '@summer-js/summer'

@Controller
export class LoggerController {
  @Get('/log')
  add() {
    Logger.log('警告')
    Logger.info('信息')
    Logger.error('错误')
    Logger.warn('警告')
  }
}

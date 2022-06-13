import { Controller, createPropertyDecorator, Get } from '@summer-js/summer'

export const MySQLConfig = createPropertyDecorator((config) => {
  return config['MySQL']
})

@Controller
export class ConfigInjectController {
  @MySQLConfig
  mysqlConfig

  @Get('/mysql-host')
  host() {
    return this.mysqlConfig.host
  }
}

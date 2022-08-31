import { Controller, Get } from '@summer-js/summer'
import { GenericService } from '../service/GenericService'

export class GType {}

@Controller
export class GenericController {
  genericService: GenericService<GType, GType>

  @Get('/generic-inject-test')
  testGenericService() {
    return this.genericService.t instanceof GType
  }
}

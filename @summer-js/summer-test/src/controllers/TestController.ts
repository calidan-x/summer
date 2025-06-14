import { Controller, Get, Patch } from '@summer-js/summer'

import { t } from './Test6'
import { PetService } from './TestService'

@Controller('/test')
export class TestController {
  petService: PetService
  @Patch('/pet')
  test() {
    return this.petService.getPet()
  }

  @Get('/a')
  a() {
    console.log(t)
  }
}

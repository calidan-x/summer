import { Controller, Get, Patch, Serialize } from '@summer-js/summer'

import { PetService } from './TestService'

export enum Animal {
  'Dog' = 1,
  'Cat' = 2
}
export class A {
  @Serialize((val) => {
    return val
  })
  animal: Animal
}

@Controller('/test')
export class TestController {
  petService: PetService
  @Patch('/pet')
  test() {
    return this.petService.getPet()
  }

  @Get('/a')
  a() {
    const a = new A()
    a.animal = Animal.Dog
    return a
  }
}

import { Controller, Get, Service } from '@summer-js/summer'
import { GenericService } from '../service/GenericService'

export interface Class extends Function {
  new (...args: any[]): any
}

class Dog {
  name: string
}

class Cat {
  name: string
}

@Service
export class AnimalService<AnimalType extends Dog | Cat> {
  animal: AnimalType
  constructor(Type: any) {
    if (Type) {
      this.animal = new Type()
    }
  }
}

export class GType {}

@Controller
export class GenericInjectController {
  genericService: GenericService<GType, GType>
  dogService: AnimalService<Dog>
  catService: AnimalService<Cat>

  @Get('/generic-inject-test')
  testGenericService() {
    return this.genericService.t instanceof GType
  }

  @Get('/generic-inject-test2')
  testGenericService2() {
    console.log(this.catService)
    return this.dogService.animal instanceof Dog && this.catService.animal instanceof Cat
  }
}

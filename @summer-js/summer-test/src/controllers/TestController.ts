import { Body, Controller, Patch } from '@summer-js/summer'

export class Pet {
  name: string
  age?: number
}

@Controller('/test')
export class TestController {
  @Patch('/pet')
  test(@Body pet: Partial<Pet>) {
    return pet
  }
}

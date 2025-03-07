import { Body, Controller, Get, Patch, Query } from '@summer-js/summer'

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

  @Get('/a')
  a(@Query q: int) {
    console.log(q)
  }
}

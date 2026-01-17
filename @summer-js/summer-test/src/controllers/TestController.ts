import { Controller, Get, serialize, SERIALIZE_ENUMS } from '@summer-js/summer'

import { PetService } from './TestService'

export enum Animal {
  'Dog' = 1,
  'Cat' = 2,
  'Pig' = 3
}

export enum Animal2 {
  'Dog' = 'dog',
  'Cat' = 'cat',
  'Cow2' = 'cow2'
}

export class G {
  a: number
  animal: Animal
}

export class A {
  [SERIALIZE_ENUMS]: [Animal, typeof Animal, Animal2, typeof Animal2]

  animal: Animal
  animal2: Animal2
  age: number
  createTime: Date
  g: G[]
}

@Controller('/test')
export class TestController {
  petService: PetService

  @Get('/pet')
  test() {
    return this.petService.getPet()
  }

  @Get('/a')
  a() {
    const a = new A()
    a.animal = Animal.Dog
    a.age = 213
    a.g = [new G()]
    a.g[0].animal = Animal.Cat
    a.createTime

    const serializedA = serialize(a)
    serializedA.animal2 = 'Cow2'
    serializedA.g[0].animal = 'Dog'
    serializedA.createTime = 1

    console.log('1', a)
    console.log('2', serializedA)
    console.log('3', serialize(serializedA))

    return a
  }
}

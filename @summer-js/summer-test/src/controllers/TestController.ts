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
  animal?: Animal
}

export class A {
  [SERIALIZE_ENUMS]: [Animal, typeof Animal, Animal2, typeof Animal2]

  animal?: Animal
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

    const b = new A()
    b.animal = Animal.Pig

    const serializedA = serialize(a)
    // const serializedA: EnumToString<A, [Animal, typeof Animal, Animal2, typeof Animal2]>
    serializedA.animal2 = 'Cow2'
    serializedA.animal = 'Dog'
    serializedA.g[0].animal = 'Pig'
    serializedA.createTime = new Date()

    console.log('1', a)
    console.log('2', serializedA)
    console.log('3', serialize(serializedA))

    const serializedArr = serialize([a, b])
    console.log(serializedArr)
    // const aaa:         EnumToString<A, [Animal, typeof Animal, Animal2, typeof Animal2]>
    const aaa = serializedArr[0]
    aaa.animal2 = 'Cat'
    aaa.animal = 'Pig'
    /// serializedArr[0].animal = 'Pig'

    return a
  }
}

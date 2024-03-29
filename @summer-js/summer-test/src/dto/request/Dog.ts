import { Animal } from './Animal'

enum Color {
  'Blue' = 'blue',
  'Black' = 'black',
  'Brown' = 'brown'
}

class Toy {
  id: int
  name: string
}

export class Dog extends Animal {
  eyeColor: Color
  tailLength: number
  toys: Toy[]
  legLength?: number

  bark() {
    console.log('wang wang!')
  }
}

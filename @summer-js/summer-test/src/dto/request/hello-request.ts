import { Max, Min, MaxLen } from '@summer-js/summer'
import { Pet } from './Pet'

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}

export enum Direction2 {
  Up = 'hi',
  Down = 'go',
  Left = 'we',
  Right = 'hill'
}

enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = 'YES'
}

class Base {
  id: number
}

export class HelloRequest extends Base {
  @MaxLen(5)
  message: string[]

  direction: Direction

  pet: Pet[]
}

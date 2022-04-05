import { Controller, Post, Body } from '@summer-js/summer';

class Animal {
  name: string;
  weight: number;
}

class Dog extends Animal {
  noseLength: number;
  eyesColor?: 'blue' | 'brown' = 'blue';
}

@Controller
export class AnimalController {
  @Post('/dogs')
  add(@Body dog: Dog) {
    console.log(typeof dog, dog);
  }
}

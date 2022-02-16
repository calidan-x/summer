import { Body, Controller, Get, Post, Query, Response, fillData } from '@summer/summer';
import { Dog } from '../dto/request/Dog';

@Controller('')
export class HelloController {
  @Get()
  hello() {
    const dog = fillData(new Dog(), { tailLength: 323, aa: 'Ss' });
    return 'Hello Summer!';
  }

  @Get('/error')
  error() {
    throw new Error('hello');
  }
}

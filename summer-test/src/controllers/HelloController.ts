import { Body, Controller, Get, Post, Query, Response } from '../../lib/decorators';
import { fillData } from '../../lib/utils';
import { Dog } from '../dto/request/Dog';

@Controller('/')
export class HelloController {
  @Get()
  hello() {
    const dog = fillData(new Dog(), { tailLength: 323, aa: 'Ss' });
    return 'Hello Summer!';
  }

  @Post()
  helloP(@Body aaa: Dog) {
    return aaa;
  }
}

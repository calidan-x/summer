import { Body, Controller, Get, Post, Query, Response, fillData, Request, RequestPath } from '@summer/summer';
import fs from 'fs';
import { Dog } from '../dto/request/Dog';

@Controller('')
export class HelloController {
  @Get()
  hello() {
    return 'Hello Summer!';
  }

  @Get('/error')
  error() {
    throw new Error('hello');
  }
}

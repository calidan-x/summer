import { Controller, Post, Body } from '@summer-js/summer';

class Book {
  title: string;
  author: string;
}

@Controller('/example')
export class ExampleController {
  @Post('/array-test')
  api(@Body param: Book[]) {
    console.log(typeof param, param);
  }
}

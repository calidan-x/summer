import { Controller, fillData, Get, PathParam } from '@summer-js/summer';

class Person {
  id: number;
  name: string;
  age: int;
}

class Book {
  id: number;
  title: string;
}

class BookResource {
  id: number;
  title: string;
  author: Person;
}

@Controller
export class BookController {
  @Get('/books/:id')
  list(@PathParam id: number) {
    const bookResource: BookResource = new BookResource();
    const book: Book = new Book();
    book.id = id;
    fillData(bookResource, book);
    bookResource.author = new Person();
    return bookResource;
  }
}

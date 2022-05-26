enum Process {
  文字 = 1,
  文字2 = 11
}

enum Process2 {
  'a' = 'aa',
  'b' = 'bb'
}

export class Book {
  name: string
  process2: Process2
  process: Process
}

export const getBook = () => {
  return new Book()
}

export const getBook2 = () => {
  return [new Book(), new Book()]
}

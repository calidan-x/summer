import { Controller, Get } from '@summer-js/summer'
import { Collection } from '@summer-js/mongodb'

class User {
  name: string
  age: number
}

@Controller('/v1/mongo')
export class MangoDBController {
  user: Collection<User>

  @Get
  test() {
    this.user.insertMany([{ name: 'tom', age: 123 }])
    this.user.createIndex({ b: 1 })
  }
}

import { Controller, Get } from '@summer-js/summer'
import { ApiDocGroup } from '@summer-js/swagger'

import { TodoService } from './TodoService'

@Controller
@ApiDocGroup('Todo Apis')
export class TodoController {
  todoService: TodoService

  @Get('/todos')
  list() {
    return this.todoService.getTodos()
  }

  // @Post('/todos')
  // add() {
  //   return this.todoService.addTransaction()
  // }
}

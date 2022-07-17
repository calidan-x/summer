import { TodoService } from './TodoService'
import { Controller, Get, Inject } from '@summer-js/summer'
import { ApiDocGroup } from '@summer-js/swagger'

@Controller
@ApiDocGroup('Todo Apis')
export class TodoController {
  @Inject
  todoService: TodoService

  @Get('/todos')
  list() {
    return this.todoService.getTodos()
  }
}

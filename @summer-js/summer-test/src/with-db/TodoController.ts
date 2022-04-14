import { TodoService } from './TodoService'
import { Controller, Get, Inject } from '@summer-js/summer'

@Controller
export class TodoController {
  @Inject
  todoService: TodoService

  @Get('/todos')
  list() {
    return this.todoService.getTodos()
  }
}

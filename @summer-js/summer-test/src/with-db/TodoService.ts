import { Service, sync } from '@summer-js/summer'
import { getRepository } from './DataSource'

import { Todo } from '../entity/todo'

@Service
export class TodoService {
  todoRepository = getRepository(Todo)

  getTodos() {
    console.log(sync(this.todoRepository.find()))
    return sync(this.todoRepository.find())
  }

  async addTodo() {
    const todo = new Todo()
    return this.todoRepository.save(todo)
  }
}

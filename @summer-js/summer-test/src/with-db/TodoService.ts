import { Service } from '@summer-js/summer'
import { Repository, Transaction } from '@summer-js/typeorm'

import { Todo } from '../entity/Todo'

@Service
export class TodoService {
  todoRepository: Repository<Todo>

  async getTodos() {
    return await this.todoRepository.find()
  }

  async addTodo() {
    const todo = new Todo()
    return this.todoRepository.save(todo)
  }

  @Transaction
  async addTransaction() {
    let todo = new Todo()
    todo.id = 110
    todo.content = ''
    todo.isDone = false
    await this.todoRepository.save(todo)
    throw new Error('error')
  }
}

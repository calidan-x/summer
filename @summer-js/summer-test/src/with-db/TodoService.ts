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
    todo.id = 111
    todo.content = ''
    todo.isDone = false
    await this.todoRepository.insert(todo)
    const a = await this.todoRepository.find({ where: { id: 111 } })
    console.log(a)
    const b = await this.todoRepository.query('select * from todo')
    console.log(b)
    throw new Error('error')
  }
}

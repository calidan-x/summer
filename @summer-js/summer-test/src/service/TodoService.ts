import { Service } from '@summer-js/summer'
import { getRepository } from 'typeorm'

import { Todo } from '../entity/todo'

@Service
export class TodoService {
  todoRepository = getRepository(Todo)

  async getTodos() {
    return this.todoRepository.find()
  }

  async addTodo() {
    const todo = new Todo()
    return this.todoRepository.save(todo)
  }
}

import { Service } from '@summer-js/summer';

@Service
export class TodoService {
  async getTodos() {
    return ['Task 1', 'Task 2', 'Task 3'];
  }
}

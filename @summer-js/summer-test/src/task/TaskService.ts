import { Scheduled, Service } from '@summer-js/summer'

@Service
export class TaskService {
  @Scheduled({ corn: '* * * * *' })
  print() {
    console.log(new Date())
  }
}

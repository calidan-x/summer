import { Scheduled, Service } from '@summer-js/summer'

@Service
export class TaskService {
  // @Scheduled({ fixedRate: 1000 })
  print() {
    console.log(new Date())
  }
}

import { Scheduled, Service } from '@summer-js/summer'

@Service
export class TaskService {
  @Scheduled({ fixedRate: 2000 })
  print() {
    // console.log('Scheduled', new Date())
  }
}

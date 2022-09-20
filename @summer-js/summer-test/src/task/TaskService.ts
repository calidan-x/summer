import { Scheduled, Service } from '@summer-js/summer'

@Service
export class TaskService {
  @Scheduled({ cron: '* * * * *' })
  print() {
    console.log(new Date())
  }
}

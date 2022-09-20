import { Scheduled, Service } from '@summer-js/summer'

@Service
export class TaskService {
  @Scheduled({ cron: '* * * * *', timeZone: 'UTC' })
  print() {
    console.log(new Date())
  }
}

var cron = require('node-cron')
import { getInjectable } from './loc'
import { Logger } from './logger'

interface ScheduledTask {
  class: any
  methodName: string
  cronOrFixedRate: { cron: string; timeZone?: string } | { fixedRate: number }
}

export const scheduledTask = {
  scheduledTasks: [],
  add(scheduledTask: ScheduledTask) {
    this.scheduledTasks.push(scheduledTask)
  },
  start() {
    this.scheduledTasks.forEach((st: ScheduledTask) => {
      const task = () => {
        const inc = getInjectable(st.class)
        if (inc) {
          inc[st.methodName]()
        } else {
          Logger.error(
            'Unable to run scheduled task. ' +
              st.class.name +
              ' is not an injectable class, please add @Injectable/@Service to fixed.'
          )
        }
      }
      if (st.cronOrFixedRate['corn']) {
        cron.schedule(st.cronOrFixedRate['corn'], task, {
          scheduled: true,
          timezone: st.cronOrFixedRate['timeZone']
        })
      } else if (st.cronOrFixedRate['fixedRate']) {
        setInterval(task, st.cronOrFixedRate['fixedRate'])
      }
    })
  }
}

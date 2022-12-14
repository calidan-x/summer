const cron = require('node-cron')
import { getInjectable } from './ioc'
import { Logger } from './logger'

interface ScheduledTask {
  class: any
  methodName: string
  cronOrFixedRate: { cron: string; timeZone?: string } | { fixedRate: number }
}

export const scheduledTask = {
  scheduledTasks: [],
  cornTasks: [],
  fixedRateTasks: [],
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
      if (st.cronOrFixedRate['cron']) {
        const scheduledTask = cron.schedule(st.cronOrFixedRate['cron'], task, {
          scheduled: true,
          timezone: st.cronOrFixedRate['timeZone']
        })
        this.cornTasks.push(scheduledTask)
      } else if (st.cronOrFixedRate['fixedRate']) {
        this.fixedRateTasks.push(setInterval(task, st.cronOrFixedRate['fixedRate']))
      }
    })
  },
  stop() {
    this.cornTasks.forEach((cornTask) => {
      cornTask.stop()
    })
    this.fixedRateTasks.forEach((fixedRateTask) => {
      clearInterval(fixedRateTask)
    })
  }
}

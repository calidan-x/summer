import { scheduledTask } from '../scheduled-tasks'

export const Scheduled = (
  cronOrFixedRate: { cron: string; timeZone?: string } | { fixedRate: number }
): MethodDecorator => {
  return (target: any, methodName: string | symbol) => {
    if ((cronOrFixedRate as any).cron) {
      ;(cronOrFixedRate as any).timeZone = (cronOrFixedRate as any).timeZone
    }
    scheduledTask.add({ class: target.constructor, methodName: methodName as string, cronOrFixedRate })
  }
}

Scheduled.setDefaultTimeZone = (timeZone: string) => {
  scheduledTask.defaultTimeZone = timeZone
}

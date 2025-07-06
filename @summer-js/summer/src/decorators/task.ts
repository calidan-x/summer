import { scheduledTask } from '../scheduled-tasks'

export const Scheduled = (
  cronOrFixedRate: { cron: string; timeZone?: string } | { fixedRate: number }
): MethodDecorator => {
  return (target: any, methodName: string) => {
    if ((cronOrFixedRate as any).cron) {
      ;(cronOrFixedRate as any).timeZone = (cronOrFixedRate as any).timeZone || Scheduled.defaultTimeZone
    }
    scheduledTask.add({ class: target.constructor, methodName, cronOrFixedRate })
  }
}

Scheduled.defaultTimeZone = undefined as string | undefined

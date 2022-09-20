import { scheduledTask } from '../scheduled-tasks'

export const Scheduled = (
  cronOrFixedRate: { cron: string; timeZone?: string } | { fixedRate: number }
): MethodDecorator => {
  return (target: any, methodName: string) => {
    scheduledTask.add({ class: target.constructor, methodName, cronOrFixedRate })
  }
}

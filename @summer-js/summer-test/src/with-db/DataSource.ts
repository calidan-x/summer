import { EntityTarget, ObjectLiteral } from 'typeorm'
import { getDataSource } from '@summer-js/typeorm'

export const getRepository = <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
  // if (process.env.SUMMER_ENV === 'prod') {
  //   return {} as any
  // }
  return getDataSource('DATA_SOURCE').getRepository(entity)
}

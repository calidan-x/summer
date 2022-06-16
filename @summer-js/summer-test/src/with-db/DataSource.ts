import { EntityTarget } from 'typeorm'
import { getDataSource } from '@summer-js/typeorm'

export const getRepository = <T>(entity: EntityTarget<T>) => {
  // if (process.env.SUMMER_ENV === 'prod') {
  //   return {} as any
  // }
  return getDataSource('DATA_SOURCE').getRepository(entity)
}

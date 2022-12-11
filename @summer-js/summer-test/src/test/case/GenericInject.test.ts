import { getInjectable } from '@summer-js/summer'
import { request } from '@summer-js/test'
import { GType } from '../../controllers/GenericInjectController'
import { GenericService } from '../../service/GenericService'

describe('Test Loc', () => {
  test('should inject works', async () => {
    let res = await request.get('/generic-inject-test')
    expect(res.body).toBe('true')
    res = await request.get('/generic-inject-test2')
    expect(res.body).toBe('true')
  })

  test('should getInjectable works', async () => {
    const genericService = getInjectable(GenericService, [GType, GType])
    expect(genericService.t instanceof GType).toBe(true)
    expect(genericService.k instanceof GType).toBe(true)
  })
})

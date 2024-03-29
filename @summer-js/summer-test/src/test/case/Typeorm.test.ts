import { request } from '@summer-js/test'
import fs from 'fs'

describe('Test TypeORM', () => {
  test('should collect Entity and Migration', async () => {
    const indexContent = fs.readFileSync(__dirname + '/../../index.js', { encoding: 'utf-8' })
    expect(indexContent.indexOf('./entity/Person') > 0).toEqual(true)
    expect(indexContent.indexOf('/migrations/1650585292097-migration') > 0).toEqual(true)
  })

  test('should read Database', async () => {
    const res = await request.get('/todos')
    expect(res.body).toEqual([])
  })
})

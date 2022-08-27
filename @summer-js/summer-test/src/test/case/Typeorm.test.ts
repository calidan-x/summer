import { initTest, endTest } from '@summer-js/test'
import fs from 'fs'

describe('Test AWB Lambda', () => {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should Collect Entity and Migration', async () => {
    const indexContent = fs.readFileSync(__dirname + '/../../index.js', { encoding: 'utf-8' })
    expect(indexContent.indexOf('./entity/Person') > 0).toEqual(true)
    expect(indexContent.indexOf('/migrations/1650585292097-migration') > 0).toEqual(true)
  })
})

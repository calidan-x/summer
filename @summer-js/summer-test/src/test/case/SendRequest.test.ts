import { getInjectable } from '@summer-js/summer'
import { initTest, endTest } from '@summer-js/test'

import { SendRequestClient } from '../sendrequest/SendRequestClient'

describe('Test Send Request', () => {
  let server
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })

  test('should return right value', async () => {
    const sendRequestClient = getInjectable(SendRequestClient)
    const homePage = await sendRequestClient.getHomePage()
    expect(homePage).toContain('Summer')
  })
})

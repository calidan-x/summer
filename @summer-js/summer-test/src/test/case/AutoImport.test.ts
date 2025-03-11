import { animalCollections, commonCollections } from '@/decorators/Collection'
import '@summer-js/test'

describe('Test Auto Import', () => {
  test('should import file', async () => {
    expect(animalCollections.length).toBe(3)
    expect(commonCollections.length).toBe(1)
  })
})

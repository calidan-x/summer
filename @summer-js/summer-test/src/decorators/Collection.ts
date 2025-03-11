import { Service } from '@summer-js/summer'

export const animalCollections: any[] = []
export const commonCollections: any[] = []

// @auto-import
export const Animal = (constructor: Function) => {
  animalCollections.push(constructor)
}

// @auto-import
export function Collection(constructor: Function) {
  commonCollections.push(constructor)
}

// @auto-import
export const FoodService = Service({ tags: ['xxx', 'yy'] })

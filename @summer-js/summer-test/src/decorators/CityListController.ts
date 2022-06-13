import { Controller, createPropertyDecorator, Get } from '@summer-js/summer'

export const CityList = createPropertyDecorator(() => {
  return ['Shanghai', 'Tokyo', 'New York City']
})

@Controller
export class CityListController {
  @CityList
  cityList

  @Get('/cities')
  list() {
    return this.cityList
  }
}

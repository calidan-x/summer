import { Body, Controller, Post, Query } from '@summer-js/summer'
// import { ApiDocGroup } from '@summer-js/swagger'

export enum D2 {
  M,
  F
}

export enum D3 {
  M = 'M',
  F = 'F'
}

export class DD {
  d1?: 'male' | null
  // d2: D2
  // d3: D3
}

@Controller('/test')
// @ApiDocGroup('Test')
export class TestController {
  @Post
  test(@Body dd: DD, @Query name: string) {
    return dd + name
  }
}

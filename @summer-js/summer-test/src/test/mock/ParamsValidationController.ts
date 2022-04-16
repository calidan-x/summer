import { Body, Controller, Get, Post, Query } from '@summer-js/summer'
import { Dog } from '../../dto/request/Dog'

class Obj {
  key: string
}

enum NumberEnum {
  E1 = 1,
  E2 = 2
}

enum StringEnum {
  E1 = 'E1',
  E2 = 'E2'
}

@Controller()
export class ParamsValidationController {
  @Get('/request-basic-type-value')
  async requestBasicTypeValue(
    @Query notypeValue,
    @Query anyValue: any,
    @Query stringValue: string,
    @Query intValue: int,
    @Query bigintValue: bigint,
    @Query numberValue: number,
    @Query booleanValue: boolean,
    @Query numberEnumValue: NumberEnum,
    @Query stringEnumValue: StringEnum,
    @Query objValue: Obj,
    @Query anyArrayValue: any[],
    @Query stringArrayValue: string[],
    @Query intArrayValue: int[],
    @Query numberArrayValue: number[],
    @Query booleanArrayValue: boolean[],
    @Query numberEnumArrayValue: NumberEnum[],
    @Query stringEnumArrayValue: StringEnum[],
    @Query objArrayValue: Obj[],
    @Query stringUnionValue: 'SU1' | 'SU2'
  ) {
    let value =
      notypeValue ||
      anyValue ||
      stringValue ||
      intValue ||
      bigintValue ||
      numberValue ||
      numberEnumValue ||
      stringEnumValue ||
      booleanValue ||
      anyArrayValue ||
      stringArrayValue ||
      intArrayValue ||
      numberArrayValue ||
      booleanArrayValue ||
      objArrayValue ||
      numberEnumArrayValue ||
      stringEnumArrayValue ||
      objValue ||
      stringUnionValue
    if (booleanValue !== undefined) {
      value = booleanValue
    }
    let type = typeof value

    return { type, value }
  }

  @Post('/request-body-value')
  async requestBodyValue(@Body dog: Dog) {
    let type = typeof dog
    return { type, value: dog }
  }
}

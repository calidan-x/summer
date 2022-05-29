import {
  Body,
  Controller,
  Get,
  Min,
  Post,
  Query,
  Max,
  MinLen,
  MaxLen,
  Email,
  Pattern,
  Validate
} from '@summer-js/summer'
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

class OptionalRequest {
  optionalKey?: string
  requiredKey: string
}

class MinRequest {
  @Min(10)
  min: int
}

class MaxRequest {
  @Max(10)
  max: int
}

class MinLenRequest {
  @MinLen(5)
  minLen: string
}

class MaxLenRequest {
  @MaxLen(5)
  maxLen: string
}

class EmailRequest {
  @Email
  email: string
}

class PatternRequest {
  @Pattern(/\d+/)
  pattern: string
}

class CustomValidateRequest {
  @Validate((val: string) => {
    return val.indexOf(',') > 0
  })
  value: string
}

enum GenderNum {
  Male = 1,
  Female = 2
}

enum GenderStr {
  Male = 'male',
  Female = 'female'
}

class EnumGroup {
  genderNum: GenderNum
  genderStr: GenderNum
}

class EnumRequest {
  genderNum: GenderNum
  genderStr: GenderStr
  obj: EnumGroup
  arr: EnumGroup[]
}

@Controller
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
    @Query stringUnionValue: 'SU1' | 'SU2' | 'SU:3',
    @Query fixedStringValue: 'str:ing'
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
      stringUnionValue ||
      fixedStringValue
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

  @Post('/request-key-validate/optional')
  optionalKey(@Body request: OptionalRequest) {
    return request
  }

  @Post('/request-key-validate/min')
  minKey(@Body request: MinRequest) {
    return request
  }

  @Post('/request-key-validate/max')
  maxKey(@Body request: MaxRequest) {
    return request
  }

  @Post('/request-key-validate/min-len')
  minLenKey(@Body request: MinLenRequest) {
    return request
  }

  @Post('/request-key-validate/max-len')
  maxLenKey(@Body request: MaxLenRequest) {
    return request
  }

  @Post('/request-key-validate/email')
  emailKey(@Body request: EmailRequest) {
    return request
  }

  @Post('/request-key-validate/pattern')
  patternKey(@Body request: PatternRequest) {
    return request
  }

  @Post('/request-key-validate/custom-validate')
  customValidateKey(@Body request: CustomValidateRequest) {
    return request
  }

  @Post('/request-key-validate/enum')
  enum(@Body request: EnumRequest) {
    return request
  }
}

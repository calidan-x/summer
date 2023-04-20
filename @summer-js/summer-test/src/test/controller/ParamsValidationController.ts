import {
  Body,
  Controller,
  Get,
  Min,
  Post,
  Query,
  Queries,
  Max,
  MinLen,
  MaxLen,
  Email,
  Pattern,
  Validate,
  Header,
  Len,
  IgnoreUnknownProperties
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
  optionalInteger?: int
}

class BlankRequest {
  blankKey!: string
}

@IgnoreUnknownProperties
class IgnoreUnknownProps {
  a: number
  b: string
}

class ValidateUnknownProps {
  a: number
  b: string
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

class LenRequest {
  @Len(5)
  len: string

  @Len(2, 5)
  lenRange: string
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
    if (val.indexOf(',') > 0) {
      return true
    }
    return 'Data must has ,'
  })
  value: string

  @Validate((val: string) => {
    if (val.indexOf(',') > 0) {
      return true
    }
    return false
  })
  value2: string
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

class DateValidateRequest {
  date: Date
}

class EmptyRequest {
  normal?: string
  notEmptyString: string
}

class Search {
  isCity: boolean
  name: string
  count = 100
}

class NullableRequest {
  name?: string | null
}

@Controller
export class ParamsValidationController {
  @Get('/request-basic-type-value')
  async requestBasicTypeValue(
    @Query notypeValue?,
    @Query anyValue?: any,
    @Query stringValue?: string,
    @Query intValue?: int,
    @Query bigintValue?: bigint,
    @Query numberValue?: number,
    @Query booleanValue?: boolean,
    @Query numberEnumValue?: NumberEnum,
    @Query stringEnumValue?: StringEnum,
    @Query objValue?: Obj,
    @Query anyArrayValue?: any[],
    @Query stringArrayValue?: string[],
    @Query intArrayValue?: int[],
    @Query numberArrayValue?: number[],
    @Query booleanArrayValue?: boolean[],
    @Query numberEnumArrayValue?: NumberEnum[],
    @Query stringEnumArrayValue?: StringEnum[],
    @Query objArrayValue?: Obj[],
    @Query stringUnionValue?: 'SU1' | 'SU2' | 'SU:3',
    @Query fixedStringValue?: 'str:ing'
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

    return { type, value } as any
  }

  @Get('/request-queries')
  async requestQueries(@Queries search?: Search) {
    return search!
  }

  @Post('/request-body-value')
  async requestBodyValue(@Body dog: Dog) {
    let type = typeof dog
    return { type, value: dog } as any
  }

  @Post('/request-key-validate/optional')
  optionalKey(@Body request: OptionalRequest) {
    return request
  }

  @Post('/optional-body')
  optionalBody(@Body request?: int) {
    return typeof request + request
  }

  @Post('/optional-body-object')
  optionalBodyObject(@Body request?: BlankRequest) {
    return typeof request + ''
  }

  @Post('/request-key-validate/blank')
  blankKey(@Body request: BlankRequest) {
    return request
  }

  @Post('/request-key-validate/ignore-unknown-props')
  ignoreUnknownProp(@Body request: IgnoreUnknownProps) {
    return request
  }

  @Post('/request-key-validate/validate-unknown-props')
  validateUnknownProp(@Body request: ValidateUnknownProps) {
    return request
  }

  @Post('/request-key-validate/optional-no-type')
  optionalNoType(@Header headerKey: string) {
    return headerKey
  }

  @Post('/request-key-validate/param-optional')
  paramOptional(@Query keyword?: string) {
    return keyword!
  }

  @Post('/request-key-validate/param-required')
  paramRequired(@Query keyword: string) {
    return keyword
  }

  @Post('/request-key-validate/param-empty')
  paramEmpty(@Body emptyRequest: EmptyRequest) {
    return emptyRequest
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

  @Post('/request-key-validate/len')
  equalsLenKey(@Body request: LenRequest) {
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

  @Post('/request-key-validate/date')
  date(@Body request: DateValidateRequest) {
    return request
  }

  @Post('/request-key-validate/nullable')
  nullable(@Body request: NullableRequest) {
    return request
  }
}

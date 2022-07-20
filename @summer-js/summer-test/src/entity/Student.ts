import { Text, TinyInt, Boolean, Primary, Int, VarChar, Entity, SmallInt, Float } from '@summer-js/typeorm'

@Entity()
export class Student {
  // Id
  @Primary({ autoIncrement: true })
  id: Int

  /* 姓名
   姓名     */
  name: VarChar<255> = 'Tom'

  // 年龄
  age: SmallInt

  // 班级
  class?: VarChar<22>

  // 身高
  height: Float<10, 5>

  // 是会员
  isMember: Boolean
}

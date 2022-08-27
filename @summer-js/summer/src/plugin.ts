import { ClassDeclaration } from 'ts-morph'

export class SummerPlugin {
  configKey: string
  compile(clazz: ClassDeclaration, modifyActions: (() => void)[]) {}
  postCompile() {}
  init(config: any) {}
  destroy() {}

  #classCollection = []
  collectClass(clazz: ClassDeclaration, collectName: string, modifyActions: (() => void)[]) {
    modifyActions.push(() => {
      clazz.addDecorator({ name: 'ClassCollect', arguments: ["'" + collectName + "'"] })
      clazz.getChildren()[0].replaceWithText(
        clazz
          .getChildren()[0]
          .getText()
          .replace(/\n[^\n]*@ClassCollect/g, ' @ClassCollect')
      )
    })
    this.#classCollection.push(clazz)
  }
  getClassCollection() {
    return this.#classCollection
  }
}

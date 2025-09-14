import { ClassDeclaration } from 'ts-morph'

export class SummerPlugin {
  configKey: string
  //@ts-ignore
  compile(clazz: ClassDeclaration, modifyActions: (() => void)[]) {}
  //@ts-ignore
  postCompile(isFirstCompile?: boolean) {}
  //@ts-ignore
  init(config: any) {}
  //@ts-ignore
  postInit(config: any) {}
  destroy() {}

  #classCollection: any[] = []
  collectClass(clazz: ClassDeclaration) {
    this.#classCollection.push(clazz)
  }
  getClassCollection() {
    return this.#classCollection
  }
}

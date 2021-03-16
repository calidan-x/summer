import 'reflect-metadata';

export const locContainer = {
  locClass: [],
  locInstance: {},
  initLoc() {
    this.instanceLocClasses();
    this.resolveInject();
  },
  addInstance(instance: object) {
    const className = instance.constructor.name;
    if (this.locInstance[className]) {
      console.error('Dulplicate ClassName: ' + className);
      return;
    }
    this.locInstance[className] = instance;
  },
  getInstance(className: string) {
    if (!this.locInstance[className]) {
      console.error(className + ' is not added to loc container');
      return;
    }
    return this.locInstance[className];
  },
  paddingLocClass(clazz: Function) {
    this.locClass.push(clazz);
  },
  instanceLocClasses() {
    this.locClass.forEach((clazz: any) => {
      const instance = new clazz();
      this.addInstance(instance);
    });
  },
  paddingInject(target: any, propertyKey: string) {
    const t = Reflect.getMetadata('design:type', target, propertyKey);
    if (!target._paddingInject) {
      target._paddingInject = [];
    }
    target._paddingInject[propertyKey] = t.name;
  },
  resolveInject() {
    for (const locKey in this.locInstance) {
      const obj = this.locInstance[locKey];
      if (obj._paddingInject) {
        for (const injectKey in obj._paddingInject) {
          obj[injectKey] = this.getInstance(obj._paddingInject[injectKey]);
        }
        delete obj._paddingInject;
      }
      if (obj.constructor.prototype._paddingInject) {
        delete obj.constructor.prototype._paddingInject;
      }
    }
  }
};

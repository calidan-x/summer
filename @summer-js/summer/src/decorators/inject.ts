import { locContainer } from '../loc';

interface InjectDecoratorType {
  (): PropertyDecorator;
  (target: any, propertyKey: string): void;
}

interface AutoInjectDecoratorType {
  (): ClassDecorator;
  (target: any): void;
}

export const Inject: InjectDecoratorType = (...arg) => {
  if (arg.length === 0) {
    return (target: any, propertyKey: string) => {
      locContainer.paddingInject(target, propertyKey);
    };
  } else {
    locContainer.paddingInject(arg[0], arg[1]);
  }
};

export const AutoInject: AutoInjectDecoratorType = (...arg) => {
  if (arg.length === 0) {
    return (target: any) => {
      Reflect.getOwnMetadataKeys(target.prototype).forEach((key) => {
        locContainer.paddingInject(target.prototype, key, true);
      });
    };
  } else {
    Reflect.getOwnMetadataKeys(arg[0].prototype).forEach((key) => {
      locContainer.paddingInject(arg[0].prototype, key, true);
    });
  }
};

export const Component: ClassDecorator = (clazz: any) => {
  locContainer.paddingLocClass(clazz);
};

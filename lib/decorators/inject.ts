import { locContainer } from '../loc';

export const Autowired = (target: any, propertyKey: string) => {
  locContainer.paddingInject(target, propertyKey);
};

export const Component: ClassDecorator = (clazz: any) => {
  locContainer.paddingLocClass(clazz);
};

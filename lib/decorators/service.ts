import { locContainer } from '../loc';

export const Service: ClassDecorator = (serviceClass: any) => {
  locContainer.paddingLocClass(serviceClass);
};

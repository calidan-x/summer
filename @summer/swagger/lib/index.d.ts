import { SummerPlugin } from '@summer/summer';
export interface SwaggerConfig {
    info: {
        title: string;
        description?: string;
        version?: string;
        termsOfService?: string;
        contact?: {
            email: string;
        };
        license?: {
            name: string;
            url: string;
        };
    };
    host?: string;
    basePath?: string;
    swaggerDocPath: string;
}
export default class implements SummerPlugin {
    configKey: string;
    init(config: SwaggerConfig): Promise<void>;
    postCompile(): void;
}
export declare const ApiGroupDoc: (name: string, description?: string, order?: number) => (target: any) => void;
export declare const ApiDoc: (api: {
    description: string;
    request: {
        header: any;
        param: any;
        query: any;
        path: any;
        body: any;
    };
    response: {
        header: any;
        stateCode: string;
        body: any;
    }[];
    order?: number;
}) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

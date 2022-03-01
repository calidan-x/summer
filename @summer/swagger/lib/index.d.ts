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
    getAutoImportContent(): string;
    postCompile(): Promise<void>;
}
export declare const ApiGroupDoc: (name: string, description?: string, order?: number) => (target: any) => void;
interface ControllerApiDoc {
    summery: string;
    description?: string;
    requestBody?: any;
    response?: any;
    errorResponses?: Record<string | number, any>;
    order?: number;
}
export declare const ApiDoc: (api: ControllerApiDoc) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class SummerSwaggerUIController {
    getSwaggerDocument(): any;
}
export {};

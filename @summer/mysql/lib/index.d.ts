import { Decorator, ClassDeclaration } from 'ts-morph';
export interface MySQLConfig {
    host: string;
    port?: number;
    database: string;
    username: string;
    password: string;
}
interface SummerPlugin {
    configKey: string;
    compile: (classDecorator: Decorator, clazz: ClassDeclaration) => void;
    getAutoImportContent: () => void;
    init: (config: any) => void;
}
export default class implements SummerPlugin {
    configKey: string;
    entityList: any[];
    compile(classDecorator: any, clazz: any): void;
    getAutoImportContent(): string;
    init(config: any): Promise<void>;
    connect(connectOptions: MySQLConfig): Promise<void>;
}
export {};

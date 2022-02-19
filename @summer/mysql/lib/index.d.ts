import { Connection } from 'typeorm';
import { SummerPlugin } from '@summer/summer';
export interface MySQLConfig {
    host: string;
    port?: number;
    database: string;
    username: string;
    password: string;
}
export default class implements SummerPlugin {
    configKey: string;
    entityList: any[];
    dbConnections: Connection[];
    compile(classDecorator: any, clazz: any): void;
    getAutoImportContent(): string;
    init(config: any): Promise<void>;
    connect(connectOptions: MySQLConfig): Promise<void>;
    destroy(): Promise<void>;
}

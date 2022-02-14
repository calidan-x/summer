import path from 'path';
import { createConnection, Connection } from 'typeorm';
import { Logger } from '../../logger';
import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';
import { Decorator, ClassDeclaration } from 'ts-morph';

class DBNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName);
  }
  columnName(propertyName: string, customName): string {
    return customName ? customName : snakeCase(propertyName);
  }
}

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
  autoImport: () => void;
  init: (config: any) => void;
}

export default class implements SummerPlugin {
  configKey: 'MYSQL_CONFIG';
  entityList: any[];

  compile(classDecorator, clazz) {
    if (classDecorator.getName() === 'Entity') {
      const filePath = classDecorator
        .getSourceFile()
        .getFilePath()
        .replace(path.resolve('.') + '/src', '.')
        .replace(/\.ts$/, '');
      this.entityList[filePath].push(clazz.getName());
    }
  }

  autoImport() {
    const allEntities = [];
    let fileContent = '';
    for (const path in this.entityList) {
      allEntities.push(...this.entityList[path]);
      fileContent += 'import { ' + this.entityList[path].join(',') + " } from '" + path + "';\n";
    }
    fileContent += 'global["$$_ENTITIES"] = [' + allEntities.join(',') + '];';
    return fileContent;
  }

  async init(config) {
    await this.connect(config);
  }

  async connect(connectOptions: MySQLConfig) {
    const connection: Connection = await createConnection({
      type: 'mysql',
      port: 3306,
      namingStrategy: new DBNamingStrategy(),
      entities: global['$$_ENTITIES'],
      ...connectOptions
    });
    if (!connection.isConnected) {
      Logger.error('Failed to connect to database');
    }
    return connection;
  }
}

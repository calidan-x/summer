import path from 'path';
import { createConnection, Connection } from 'typeorm';
import { Summer, Logger } from '@summer/summer';
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
  getAutoImportContent: () => void;
  init: (config: any) => void;
}

export default class implements SummerPlugin {
  configKey = 'MYSQL_CONFIG';
  entityList = [];

  compile(classDecorator, clazz) {
    if (classDecorator.getName() === 'Entity') {
      const filePath = classDecorator
        .getSourceFile()
        .getFilePath()
        .replace(path.resolve('.') + '/src', '.')
        .replace(/\.ts$/, '');
      if (!this.entityList[filePath]) {
        this.entityList[filePath] = [];
      }
      this.entityList[filePath].push(clazz.getName());
    }
  }

  getAutoImportContent() {
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
    if (connectOptions) {
      const connection: Connection = await createConnection({
        type: 'mysql',
        port: 3306,
        namingStrategy: new DBNamingStrategy(),
        entities: global['$$_ENTITIES'],
        ...connectOptions
      });
      if (!connection.isConnected) {
        Logger.error('Failed to connect to database');
      } else {
        !Summer.isTestEnv && Logger.log('MySQL DB connected');
        Summer.dbConnections.push(connection);
      }
    } else {
      Logger.warning('Missing MYSQL_CONFIG in config file');
    }
  }
}

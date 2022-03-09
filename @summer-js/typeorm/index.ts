import path from 'path';
import { createConnection, Connection } from 'typeorm';
import { Logger, SummerPlugin } from '@summer-js/summer';
import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

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

export default class implements SummerPlugin {
  configKey = 'MYSQL_CONFIG';
  entityList = [];
  dbConnections: Connection[] = [];

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
        !process.env.SUMMER_TESTING && Logger.log('MySQL DB connected');
        this.dbConnections.push(connection);
      }
    } else {
      Logger.warning('Missing MYSQL_CONFIG in config file');
    }
  }

  async destroy() {
    while (this.dbConnections.length) {
      const conn = this.dbConnections.pop();
      await conn.close();
    }
  }
}

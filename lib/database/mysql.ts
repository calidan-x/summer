import { createConnection, Connection } from 'typeorm';
import { Logger } from '../logger';
import { DBNamingStrategy } from './typeorm';

export interface MySQLConfig {
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
}

export const mysqlDB = {
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
};

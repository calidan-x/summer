import { createConnection, Connection, EntitySchema } from 'typeorm';
import { log } from './logger';

export const mysqlDB = {
  async connect(connectOptions: {
    host: string;
    database: string;
    username: string;
    password: string;
    entities: (Function | string | EntitySchema<any>)[];
  }) {
    const connection: Connection = await createConnection({
      type: 'mysql',
      port: 3306,
      synchronize: true,
      ...connectOptions
    });
    if (connection.isConnected) {
      log('MySQL DB connected');
    } else {
      log('Unable to connect to the database');
    }
  }
};

export const MYSQL_CONNECT_CONFIG = {
  host: 'localhost',
  database: 'testdb',
  username: 'root',
  password: 'root',
  entities: [__dirname + '/../src/entity/*.ts']
};

export const SERVER_CONFIG = {
  port: 8080
};

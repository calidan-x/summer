import { Context, requestHandler, Summer } from '@summer/summer';
import path from 'path';

export const initTest = async () => {
  process.env.SUMMER_ENV = 'test';
  Summer.isTestEnv = true;
  await import(path.resolve('./.summer-compile/auto-imports'));
  await Summer.start();
};

export const endTest = async () => {
  while (Summer.dbConnections.length) {
    const connection = Summer.dbConnections.pop();
    await connection.close();
  }
};

export const request = {
  async get(path: string, queries?: any) {
    const context: Context = {
      request: {
        method: 'GET',
        path,
        queries
      },
      response: { code: 200, body: '', contentType: '' }
    };
    await requestHandler(context);
    return context.response;
  },
  async post(path: string, body?: any) {
    const context: Context = {
      request: {
        method: 'POST',
        path,
        body
      },
      response: { code: 200, body: '', contentType: '' }
    };
    await requestHandler(context);
    return context.response;
  }
};

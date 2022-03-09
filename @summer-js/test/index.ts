import { Context, requestHandler, summerStart, summerDestroy } from '@summer-js/summer';
import path from 'path';

export const initTest = async () => {
  process.env.SUMMER_TESTING = 'true';
  await import(path.resolve('./.summer-compile/auto-imports'));
  await summerStart();
};

export const endTest = async () => {
  summerDestroy();
};

export const request = {
  async get(path: string, queries?: any, headers?: any) {
    const context: Context = {
      request: {
        method: 'GET',
        path,
        queries,
        headers
      },
      response: { statusCode: 200, body: '' }
    };
    await requestHandler(context);
    return context.response;
  },
  async post(path: string, body?: any, headers?: any) {
    const context: Context = {
      request: {
        method: 'POST',
        path,
        body,
        headers
      },
      response: { statusCode: 200, body: '' }
    };
    await requestHandler(context);
    return context.response;
  }
};

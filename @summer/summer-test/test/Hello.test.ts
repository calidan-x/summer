import { Context, requestHandler } from '../lib/request-handler';
import { Summer } from '../lib/summer';

describe('Hello Test', () => {
  beforeAll(async () => {
    await Summer.initTest();
  });

  afterAll(async () => {
    await Summer.endTest();
  });

  test('should response hello', async () => {
    const content: Context = {
      request: {
        method: 'GET',
        path: '/'
      },
      response: { code: 200, body: '', contentType: '' }
    };
    await requestHandler(content);
    expect(content.response.body).toBe('Hello Summer!');
  });
});
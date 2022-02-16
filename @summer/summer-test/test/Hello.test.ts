import { initTest, endTest, request } from '@summer/test';

describe('Hello Test', () => {
  beforeAll(async () => {
    await initTest();
  });

  afterAll(async () => {
    await endTest();
  });

  test('should response hello', async () => {
    const response = await request.get('/');
    expect(response.body).toBe('Hello Summer!');
  });
});

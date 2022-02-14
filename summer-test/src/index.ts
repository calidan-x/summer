import { requestHandler } from '../lib/request-handler';

exports.handler = async (event) => {
  const context = {
    request: {
      method: event.httpMethod,
      path: event.path,
      queries: event.queryStringParameters,
      headers: event.headers,
      body: event.body,
      cookies: event.cookies,
      sessions: {}
    },
    response: { code: 200, body: '', contentType: '' }
  };
  await requestHandler(context);
  return context.response;
};

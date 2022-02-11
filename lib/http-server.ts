import http = require('http');
import cookie from 'cookie';
import { Logger } from './logger';
import { requestHandler } from './request-handler';
import { session, SessionConfig } from './session';

export interface ServerConfig {
  port: number;
}

export const httpServer = {
  paramsToObject(entries) {
    const result = {};
    for (const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  },
  createServer(serverConfig: ServerConfig, sessionConfig: SessionConfig) {
    http
      .createServer((req, res) => {
        let bodyData = '';
        req.on('data', (chunk) => {
          bodyData += chunk;
        });

        req.on('end', async () => {
          const urlParts = req.url.split('?');
          const cookies = cookie?.parse(req.headers.cookie || '') || {};

          const requestCtx = {
            method: req.method as any,
            path: urlParts[0],
            queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
            headers: req.headers as any,
            cookies: cookies,
            sessions: {},
            body: bodyData
          };

          let sessionCookie = '';
          if (sessionConfig) {
            const { setCookie, sessionValues } = session.getSession(cookies[session.sessionName]);
            requestCtx.sessions = sessionValues;
            sessionCookie = setCookie;
          }

          const context = { request: requestCtx, response: { code: 200, contentType: '', body: '' } };
          await requestHandler(context);
          const responseHeaders = { 'content-type': context.response.contentType };
          if (sessionCookie) {
            responseHeaders['set-cookie'] = sessionCookie;
          }
          res.writeHead(context.response.code, responseHeaders);
          res.write(context.response.body);
          res.end();
        });
      })
      .listen(serverConfig.port, '', () => {
        Logger.log('Server started at: http://127.0.0.1:' + serverConfig.port);
      });
  }
};

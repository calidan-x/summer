import http = require('http');
import cookie from 'cookie';
import mine = require('mime-types');
import fs from 'fs';
import { Logger } from './logger';
import { requestHandler } from './request-handler';
import { session, SessionConfig } from './session';
import { Context } from './';
import path = require('path');

export interface ServerConfig {
  port: number;
  serveStatic?: {
    paths: string[] | Record<string, string>;
    indexFiles?: string[];
  };
}

export const httpServer = {
  paramsToObject(entries) {
    const result = {};
    for (const [key, value] of entries) {
      result[key] = value;
    }
    return result;
  },
  createServer(serverConfig: ServerConfig, sessionConfig: SessionConfig, serverStated?: () => void) {
    http
      .createServer((req, res) => {
        let bodyData = '';
        req.on('data', (chunk) => {
          bodyData += chunk;
        });

        req.on('end', async () => {
          const urlParts = req.url.split('?');
          const requestPath = urlParts[0].split('#')[0];

          if (serverConfig.serveStatic && serverConfig.serveStatic.paths) {
            let pathMap: Record<string, string> = {};
            if (Array.isArray(serverConfig.serveStatic.paths)) {
              serverConfig.serveStatic.paths.forEach((path) => {
                pathMap[path] = path;
              });
            } else {
              pathMap = serverConfig.serveStatic.paths;
            }

            for (const staticPrePath in pathMap) {
              let requestFile = '.' + requestPath;
              const targetPath = pathMap[staticPrePath];
              if (!path.resolve(requestFile).startsWith(path.resolve(staticPrePath))) {
                continue;
              }
              if (req.url.startsWith('/' + staticPrePath + '/') || req.url === '/' + staticPrePath) {
                requestFile = requestFile.replace(staticPrePath, targetPath);
                if (targetPath.startsWith('/')) {
                  requestFile = requestFile.replace('./', '');
                }

                if (fs.existsSync(requestFile) && !fs.lstatSync(requestFile).isDirectory()) {
                } else if (
                  fs.existsSync(requestFile) &&
                  fs.lstatSync(requestFile).isDirectory() &&
                  !requestFile.endsWith('/')
                ) {
                  res.writeHead(301, { Location: requestPath + '/', 'Cache-Control': 'no-store' });
                  res.end();
                  return;
                } else if (serverConfig.serveStatic.indexFiles) {
                  let foundFile = false;
                  for (const file of serverConfig.serveStatic.indexFiles) {
                    if (fs.existsSync(requestFile + file)) {
                      requestFile = requestFile + file;
                      foundFile = true;
                      break;
                    }
                  }
                  if (!foundFile) {
                    requestFile = '';
                  }
                }

                if (requestFile) {
                  if (mine.lookup(requestFile)) {
                    res.writeHead(200, { 'Content-Type': mine.lookup(requestFile) });
                  }
                  fs.createReadStream(requestFile)
                    .pipe(res)
                    .on('finish', () => {
                      res.end();
                    });
                } else {
                  res.writeHead(404);
                  res.write('');
                  res.end();
                }
                return;
              }
            }
          }

          const cookies = cookie?.parse(req.headers.cookie || '') || {};

          const requestCtx = {
            method: req.method as any,
            path: requestPath,
            queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
            headers: req.headers as any,
            body: bodyData
          };

          const context: Context = {
            request: requestCtx,
            response: { statusCode: 200, body: '' },
            cookies: cookies
          };

          let sessionCookie = '';
          if (sessionConfig) {
            const { setCookie, sessionValues } = session.getSession(cookies[session.sessionName]);
            context.sessions = sessionValues;
            sessionCookie = setCookie;
          }

          await requestHandler(context);

          if (sessionCookie) {
            context.response.headers['set-cookie'] = sessionCookie;
          }
          res.writeHead(context.response.statusCode, context.response.headers);
          res.write(context.response.body);
          res.end();
        });
      })
      .listen(serverConfig.port, '', () => {
        Logger.log('Server started at: http://127.0.0.1:' + serverConfig.port);
        serverStated && serverStated();
      });
  }
};

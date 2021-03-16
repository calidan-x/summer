import http = require('http');
import url = require('url');
import { validate } from 'class-validator';
import { requestMapping } from './request-mapping';
import { log } from './logger';
import { convertClass } from './utils';

export const server = {
  matchPathMethod(path: string, httpMethod: string) {
    let routeData = requestMapping[path];
    if (routeData) {
      const methodData = routeData[httpMethod];
      if (methodData) {
        return {
          controller: routeData.controller,
          ...methodData
        };
      }
    } else {
      const paths = Object.keys(requestMapping);
      for (let i = 0; i < paths.length; i++) {
        routeData = requestMapping[paths[i]];
        const methodData = routeData[httpMethod];
        if (methodData) {
          const pathParamArray = routeData.pathRegExp.exec(path);
          if (pathParamArray) {
            const pathKeys = routeData.pathKeys;
            const pathParams = {};
            pathKeys.forEach((pk, inx) => {
              pathParams[pk.name] = pathParamArray[inx + 1];
            });
            return {
              controller: routeData.controller,
              pathParams,
              ...methodData
            };
          }
        }
      }
    }
    return null;
  },
  createServer(port: number) {
    http
      .createServer((req, res) => {
        let bodyData = '';
        req.on('data', (chunk) => {
          bodyData += chunk;
        });

        req.on('end', async () => {
          const path = req.url;
          const match = this.matchPathMethod(path.split('?')[0], req.method);
          if (match !== null) {
            const { controller, callMethod, params, pathParams } = match;
            const query = url.parse(req.url, true).query;
            const applyParam = [];
            let errors = [];

            for (let i = 0; i < params.length; i++) {
              const param = params[i];
              if (param) {
                if (param.paramType === 'QueryParam') {
                  applyParam.push(query[param.name]);
                } else if (param.paramType === 'PathParam') {
                  applyParam.push(pathParams[param.name]);
                } else if (param.paramType === 'RequestBody') {
                  if (param.type.name !== 'string' && param.type.name !== 'number') {
                    let bodyObject = null;
                    try {
                      bodyObject = JSON.parse(bodyData);
                    } catch (e) {
                      res.writeHead(400, { 'Content-Type': 'application/html' });
                      res.write('400 Bad Request, error parse request body.');
                      res.end();
                      return;
                    }
                    let bodyClassInstance = new param.type();
                    for (const k in bodyObject) {
                      bodyClassInstance[k] = bodyObject[k];
                    }
                    const paramErrors = await validate(bodyClassInstance);
                    errors = errors.concat(paramErrors);
                    applyParam.push(convertClass(bodyClassInstance, param.type));
                  } else {
                    applyParam.push(bodyData);
                  }
                }
              } else {
                applyParam.push(null);
              }
            }

            if (errors.length > 0) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.write(JSON.stringify({ errors }));
              res.end();
              return;
            }

            let responseData = '';
            try {
              responseData = await controller[callMethod].apply(controller, applyParam);
              if (typeof responseData === 'object') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(responseData));
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(responseData || '');
              }
            } catch (e) {
              log(e);
              res.writeHead(400, { 'Content-Type': 'application/html' });
              res.write('400 Bad Request');
            }
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.write('404 Not Found');
          }
          res.end();
        });
      })
      .listen(port, '', () => {
        log('Server started port:' + port);
      });
  }
};

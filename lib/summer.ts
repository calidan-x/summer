import figlet = require('figlet');
import { server } from './server';
import { mysqlDB } from './database';
import { MYSQL_CONNECT_CONFIG, SERVER_CONFIG } from '../resource/summer-config';
import { locContainer } from './loc';
import { requestMappingAssembler } from './request-mapping';

export const Summer = {
  loadControllers() {
    const fs = require('fs');
    const path = require('path');
    (async () => {
      const files = fs.readdirSync('./src/controller');
      for (let i = 0; i < files.length; i++) {
        const filePath = path.resolve('./src/controller', files[i]);
        await import(filePath);
      }
    })();
  },
  start() {
    figlet.text('SUMMER', (err, data) => {
      console.log(data);
      console.log('Ver 0.0.1\n');
      (async () => {
        this.loadControllers();
        await mysqlDB.connect(MYSQL_CONNECT_CONFIG);
        locContainer.initLoc();
        requestMappingAssembler.resolveControllers();
        // console.log(locContainer.locInstance);
        server.createServer(SERVER_CONFIG.port);
      })();
    });
  }
};

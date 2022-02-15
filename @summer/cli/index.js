#!/usr/bin/env node
// @ts-check

import { ChildProcess, exec, execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { program } from 'commander';
import ora from 'ora';

program.option('-b').option('-s');
program.parse();

const options = program.opts();

if (options.s) {
  const fileHashes = {};
  let childProcess = null;

  const serve = () => {
    try {
      const spinner = ora('Compiling...');
      spinner.start();

      childProcess = exec('rm -rdf .summer-compile && cross-env SUMMER_ENV=local summer-compile');

      childProcess.stdout.on('data', (data) => {
        console.log(data);
      });

      childProcess.stderr.on('data', (data) => {
        console.error(data);
      });

      childProcess.on('error', (data) => {
        console.error(data);
      });

      childProcess.on('exit', () => {
        spinner.stop();
        childProcess = exec('node --enable-source-maps ./.summer-compile/src/main.js');
        childProcess.stdout.on('data', (data) => {
          process.stdout.write(data);
        });

        childProcess.stderr.on('data', (data) => {
          process.stdout.write(data);
        });

        childProcess.on('error', (data) => {
          //@ts-ignore
          process.stdout.write(data);
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  serve();

  const watchDir = './src/';
  fs.watch(watchDir, { recursive: true }, (event, filename) => {
    const md5 = crypto.createHash('md5');
    const currentMD5 = md5.update(fs.readFileSync(watchDir + filename).toString()).digest('hex');
    if (filename.indexOf('auto-imports') >= 0) {
      return;
    }
    if (currentMD5 === fileHashes[filename]) {
      return;
    }
    if (childProcess) {
      childProcess.kill();
    }
    fileHashes[filename] = currentMD5;
    serve();
  });
}

// onchange -i -k 'src/**/*' --exclude src/auto-imports.ts -- npm run compile:dev
// rm -rdf .summer-compile && cross-env SUMMER_ENV=local node compile.mjs && node --enable-source-maps ./.summer-compile/src/main.js
// node --enable-source-maps ./.summer-compile/src/main.js

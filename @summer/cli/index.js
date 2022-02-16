#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { program } from 'commander';
import chokidar from 'chokidar';
import ora from 'ora';

program.option('-c').option('-s');
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
        childProcess = exec('node --enable-source-maps ./.summer-compile/main.js');
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
  chokidar.watch(watchDir, { ignored: 'auto-imports' }).on('all', (event, path) => {
    if (fs.lstatSync('./' + path).isDirectory()) {
      return;
    }
    const md5 = crypto.createHash('md5');
    const currentMD5 = md5.update(fs.readFileSync('./' + path).toString()).digest('hex');
    if (!fileHashes[path]) {
      fileHashes[path] = currentMD5;
      return;
    }
    if (currentMD5 === fileHashes[path]) {
      return;
    }
    if (childProcess) {
      childProcess.kill();
    }
    fileHashes[path] = currentMD5;
    serve();
  });
} else if (options.c) {
  const spinner = ora('Compiling...');
  spinner.start();
  const compileProcess = exec('rm -rdf .summer-compile && cross-env SUMMER_ENV=test summer-compile');
  compileProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  compileProcess.stderr.on('data', (data) => {
    process.stdout.write(data);
  });

  compileProcess.on('error', (data) => {
    //@ts-ignore
    process.stdout.write(data);
  });
  compileProcess.on('exit', () => {
    spinner.stop();
  });
}

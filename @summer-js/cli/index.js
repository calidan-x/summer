#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { program } from 'commander';
import chokidar from 'chokidar';
import ora from 'ora';

program.option('-c, --compile').option('-s, --serve').option('-b, --build').option('--env [char]', '', '');
program.parse();

const options = program.opts();

const clearScreen = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');

if (options.serve) {
  const fileHashes = {};
  let childProcess = null;
  let childProcess2 = null;

  const serve = () => {
    try {
      clearScreen();
      const spinner = ora('Compiling...');
      spinner.start();

      if (childProcess2) {
        childProcess2.kill();
        childProcess2 = null;
      }

      if (childProcess) {
        childProcess.kill();
        childProcess = null;
      }

      childProcess = spawn(`rm -rdf .summer-compile && cross-env SUMMER_ENV=${options.env} summer-compile`, {
        shell: true
      });

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
        if (!fs.existsSync('./.summer-compile/index.js')) {
          return;
        }

        spinner.stop();

        childProcess2 = spawn('node', ['--enable-source-maps', './.summer-compile/index.js']);

        childProcess2.stdout.on('data', (data) => {
          process.stdout.write(data);
        });

        childProcess2.stderr.on('data', (data) => {
          process.stdout.write(data);
        });

        childProcess2.on('error', (data) => {
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
  chokidar.watch(watchDir, { ignored: 'src/auto-imports.ts' }).on('all', (event, path) => {
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

    fileHashes[path] = currentMD5;
    serve();
  });
} else if (options.compile) {
  const spinner = ora('Compiling...');
  spinner.start();
  const compileProcess = exec(`rm -rdf .summer-compile && cross-env SUMMER_ENV=${options.env} summer-compile`);
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
} else if (options.build) {
  const spinner = ora('Building ...');
  spinner.start();
  const compileProcess = exec(
    `rm -rdf .summer-compile && cross-env SUMMER_ENV=${options.env} summer-compile && npx esbuild ./.summer-compile/index.js --bundle --sourcemap --platform=node --outfile=./build/index.js`
  );
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

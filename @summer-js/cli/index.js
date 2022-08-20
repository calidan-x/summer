#!/usr/bin/env node

import { exec, execSync, spawn } from 'child_process'
import kill from 'tree-kill'
import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import ora from 'ora'

const clearScreen = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')

const isTerminal = process.env.TERM !== undefined
let spinner

var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src)
  var stats = exists && fs.statSync(src)
  var isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

const printProcessData = (p) => {
  p.stdout.on('data', (dataLines) => {
    if (typeof dataLines === 'string') {
      let isProgressCommand = false
      dataLines.split('\n').forEach((data) => {
        if (['COMPILE_START', 'COMPILE_DONE'].includes(data.toString().trim())) {
          isProgressCommand = true
          return
        } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
          spinner.text = 'Compiling...' + data.trim().replace('COMPILE_PROGRESS', '')
          isProgressCommand = true
          return
        }
      })
      if (!isProgressCommand) {
        process.stdout.write(dataLines)
      }
    } else {
      spinner.stop()
      process.stdout.write(dataLines)
    }
  })

  p.stderr.on('data', (data) => {
    spinner.stop()
    process.stdout.write(data)
  })

  p.on('error', (data) => {
    spinner.stop()
    //@ts-ignore
    process.stdout.write(data)
  })
}

// name & version
const packageInfo = JSON.parse(fs.readFileSync('./package.json'))
program.version(packageInfo.version)

// SERVE
program
  .command('serve')
  .description('start dev server')
  .option('-e, --env [ENV_NAME]', '')
  .action((options) => {
    let compileProcess = null
    let serveProcess = null
    spinner = ora('Compiling...')

    const serve = () => {
      try {
        if (compileProcess) {
          kill(compileProcess.pid)
          compileProcess = null
        }

        compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile watch`)
        compileProcess.stdout.on('data', (dataLines) => {
          dataLines.split('\n').forEach((data) => {
            if (data.trim().startsWith('COMPILE_START')) {
              clearScreen()
              spinner.text = 'Compiling...'
              spinner.start()
              if (serveProcess) {
                kill(serveProcess.pid)
                serveProcess = null
              }
            } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
              spinner.text = 'Compiling...' + data.trim().replace('COMPILE_PROGRESS', '')
            } else if (data.trim().startsWith('COMPILE_DONE')) {
              spinner.text = 'Starting...'
              if (fs.existsSync('./compile/index.js')) {
                serveProcess = spawn('node', ['--enable-source-maps', './compile/index.js'])
                printProcessData(serveProcess)
              } else {
                spinner.stop()
                console.error(
                  '\x1b[31mError starting server: ./compile/index.js not exist\n\nPlease check tsconfig.ts "include" should not contains files out of ./src\x1b[0m'
                )
              }
            } else {
              if (data) {
                process.stdout.write(data + '\n')
              }
            }
          })
        })

        compileProcess.stderr.on('data', (data) => {
          if (serveProcess) {
            kill(serveProcess.pid)
            serveProcess = null
          }
          spinner.stop()
          process.stdout.write(data)
        })

        compileProcess.on('error', (data) => {
          if (serveProcess) {
            kill(serveProcess.pid)
            serveProcess = null
          }
          spinner.stop()
          //@ts-ignore
          process.stdout.write(data)
        })
      } catch (e) {
        console.log(e)
      }
    }
    serve()
  })

// TEST
program
  .command('test')
  .description('run test cases')
  .option('-e, --env [ENV_NAME]', '')
  .option('-- [JEST_OPTIONS]', '')
  .action((options) => {
    spinner = ora('Compiling...')
    spinner.start()
    const compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile test`)
    printProcessData(compileProcess)

    compileProcess.on('exit', () => {
      spinner.text = 'Starting...'
      if (fs.existsSync('./compile/index.js')) {
        const jestOptInx = program.args.findIndex((arg) => arg === '--')
        const jestOpts = jestOptInx > 0 ? program.args.splice(jestOptInx + 1).join(' ') : ''
        const withColor = isTerminal ? '--colors' : ''
        const testProcess = exec('jest ' + withColor + ' ' + jestOpts)
        printProcessData(testProcess)
        testProcess.on('exit', (signal) => {
          if (signal === 1) {
            process.exit(signal)
          }
        })
      } else {
        process.exit(1)
      }
    })
  })

// BUILD
program
  .command('build')
  .description('build production')
  .option('-e, --env [ENV_NAME]', '')
  .option('-- [ESBUILD_OPTIONS]', '')
  .action((options) => {
    spinner = ora('Compiling...')
    spinner.start()
    const compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile`)
    printProcessData(compileProcess)
    compileProcess.on('exit', (code) => {
      if (fs.existsSync('./compile/index.js')) {
        if (fs.existsSync('./resource')) {
          if (fs.existsSync('./build')) {
            fs.rmSync('./build', { recursive: true, force: true })
          }
          fs.mkdirSync('./build')
          copyRecursiveSync('./resource', './build/resource')
        }
        const esbuildOptInx = program.args.findIndex((arg) => arg === '--')
        const esbuildOpts = esbuildOptInx > 0 ? program.args.splice(esbuildOptInx + 1).join(' ') : ''
        const buildProcess = exec(
          'npx esbuild ./compile/index.js --bundle --sourcemap --minify-whitespace  --platform=node --outfile=./build/index.js ' +
            esbuildOpts
        )
        printProcessData(buildProcess)
        buildProcess.on('exit', (signal) => {
          if (signal === 1) {
            process.exit(signal)
          }
        })
      } else {
        process.exit(1)
      }
      spinner.stop()
    })
  })

program.parse()

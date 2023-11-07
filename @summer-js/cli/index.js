#!/usr/bin/env node
// @ts-check

import { exec, spawn } from 'child_process'
import kill from 'tree-kill'
import fs from 'fs'
import path from 'path'
import ora from 'ora'
import { program } from 'commander'
import esbuild from 'esbuild'

const clearScreen = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')

const isTerminal = process.stdout.isTTY
let spinner

const animation = {
  interval: 80,
  frames: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
}

var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src)
  var stats = exists && fs.statSync(src)
  var isDirectory = exists && stats && stats.isDirectory()
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
        if (['COMPILE_START', 'COMPILE_DONE', 'COMPILE_INIT'].includes(data.toString().trim())) {
          isProgressCommand = true
          return
        } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
          spinner.text = 'COMPILING...' + data.trim().replace('COMPILE_PROGRESS', '')
          isProgressCommand = true
          return
        }
      })
      if (!isProgressCommand) {
        process.stdout.write(dataLines)
      }
    } else {
      if (spinner.isSpinning) {
        spinner.stop()
      }
      process.stdout.write(dataLines)
    }
  })

  p.stderr.on('data', (data) => {
    if (spinner.isSpinning) {
      spinner.stop()
    }
    process.stderr.write(data)
  })

  p.on('error', (data) => {
    if (spinner.isSpinning) {
      spinner.stop()
    }
    process.stdout.write(data.toString())
  })
}

// esbuild
const plugin = {
  name: 'excludeVendorFromSourceMap',
  setup(build) {
    build.onLoad({ filter: /node_modules.+\.js$/ }, (args) => {
      return {
        contents:
          fs.readFileSync(args.path, 'utf8') +
          '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
        loader: 'default'
      }
    })
  }
}

const getFileSize = (file) => {
  const stats = fs.statSync(file)
  const fileSizeInBytes = stats.size
  if (fileSizeInBytes > 1024 * 1024) {
    return Math.round((fileSizeInBytes * 100) / (1024 * 1024)) / 100 + 'MB'
  }
  return Math.round((fileSizeInBytes * 100) / 1024) / 100 + 'KB'
}

// external: string[]
// fullSourceMap: boolean
const build = (env, { fullSourceMap = false, external = [] }) => {
  esbuild
    .build({
      entryPoints: ['./compile/index.js'],
      bundle: true,
      platform: 'node',
      minifyWhitespace: true,
      sourcemap: true,
      outfile: './build/index.js',
      plugins: fullSourceMap ? [] : [plugin],
      external
    })
    .then((res) => {
      if (res.errors.length === 0) {
        console.log('BUILD SUCCESS')
        console.log('----------------------------')
        console.log('ENV: ' + env + '\n')
        console.log('build/index.js      ' + getFileSize('build/index.js'))
        console.log('build/index.js.map  ' + getFileSize('build/index.js.map'))
        if (fs.existsSync('build/resource')) {
          console.log('build/resource')
        }
        console.log()
      }

      res.warnings.forEach((worn) => {
        console.warn('Warn: ', worn)
      })

      res.errors.forEach((err) => {
        console.error('Error: ', err)
      })
    })
}

// name & version
const packageInfo = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }))
program.version(packageInfo.version)

// SERVE
program
  .command('serve')
  .description('start dev server')
  .option('-e, --env [ENV_NAME]', '')
  .action((options) => {
    let compileProcess = null
    let serveProcess = null
    spinner = ora()
    spinner.color = 'yellow'
    spinner.spinner = animation

    const serve = () => {
      try {
        if (compileProcess) {
          kill(compileProcess.pid)
          compileProcess = null
        }

        compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile watch`)
        compileProcess.stdout?.on('data', (dataLines) => {
          dataLines.split('\n').forEach((data) => {
            if (data.trim().startsWith('COMPILE_INIT')) {
              clearScreen()
              spinner.text = 'INITING...'
              spinner.start()
            } else if (data.trim().startsWith('COMPILE_START')) {
              if (spinner.text !== 'INITING...') {
                clearScreen()
              }
              spinner.text = 'COMPILING...'
              spinner.start()
              if (serveProcess) {
                kill(serveProcess.pid)
                serveProcess = null
              }
            } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
              spinner.text = 'COMPILING...' + data.trim().replace('COMPILE_PROGRESS', '')
            } else if (data.trim().startsWith('COMPILE_DONE')) {
              spinner.text = 'STARTING...'
              if (fs.existsSync('./compile/index.js')) {
                serveProcess = spawn('node', ['--enable-source-maps', './compile/index.js'])
                printProcessData(serveProcess)
              } else {
                if (spinner.isSpinning) {
                  spinner.stop()
                }
                console.error(
                  '\x1b[31mError starting server: ./compile/index.js not exist\n\nPlease check tsconfig.json "include" should not contains files out of ./src\x1b[0m'
                )
              }
            } else {
              if (data) {
                process.stdout.write(data + '\n')
              }
            }
          })
        })

        compileProcess.stderr?.on('data', (data) => {
          if (serveProcess) {
            kill(serveProcess.pid)
            serveProcess = null
          }
          if (spinner.isSpinning) {
            spinner.stop()
          }
          process.stdout.write(data)
        })

        compileProcess.on('error', (data) => {
          if (serveProcess) {
            kill(serveProcess.pid)
            serveProcess = null
          }
          if (spinner.isSpinning) {
            spinner.stop()
          }
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
    spinner = ora('INITING...')
    spinner.color = 'yellow'
    spinner.spinner = animation
    spinner.start()
    const compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile test`)
    printProcessData(compileProcess)
    compileProcess.on('exit', () => {
      spinner.text = 'STARTING...'
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
  .option('-fsm, --fullSourceMap', '')
  .option('-ext, --external [NODE_MODULES]', '')
  .action((options) => {
    spinner = ora('INITING...')
    spinner.color = 'yellow'
    spinner.spinner = animation
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

        build(options.env, { fullSourceMap: options.fullSourceMap, external: (options.external || '').split(',') })
      } else {
        process.exit(1)
      }
      if (spinner.isSpinning) {
        spinner.stop()
      }
    })
  })

program.parse()

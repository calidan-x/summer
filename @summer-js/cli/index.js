#!/usr/bin/env node

import { exec, execSync, spawn } from 'child_process'
import kill from 'tree-kill'
import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import ora from 'ora'

program.option('-t, --test').option('-s, --serve').option('-b, --build').option('--env [char]', '', '')
program.parse()

const options = program.opts()

const clearScreen = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')

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
      dataLines.split('\n').forEach((data) => {
        if (['COMPILE_START', 'COMPILE_DONE'].includes(data.toString().trim())) {
          return
        } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
          spinner.text = 'Compiling' + data.trim().replace('COMPILE_PROGRESS', '') + '...'
        } else {
          process.stdout.write(data)
        }
      })
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

if (options.serve) {
  let childProcess = null
  let childProcess2 = null
  spinner = ora('Compiling...')

  const serve = () => {
    try {
      if (childProcess) {
        kill(childProcess.pid)
        childProcess = null
      }

      childProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile watch`)
      childProcess.stdout.on('data', (dataLines) => {
        dataLines.split('\n').forEach((data) => {
          if (data.trim().startsWith('COMPILE_START')) {
            clearScreen()
            spinner.start()
            if (childProcess2) {
              kill(childProcess2.pid)
              childProcess2 = null
            }
          } else if (data.trim().startsWith('COMPILE_PROGRESS')) {
            spinner.text = 'Compiling' + data.trim().replace('COMPILE_PROGRESS', '') + '...'
          } else if (data.trim().startsWith('COMPILE_DONE')) {
            spinner.text = 'Starting...'
            if (fs.existsSync('./compile/index.js')) {
              childProcess2 = spawn('node', ['--enable-source-maps', './compile/index.js'])
              printProcessData(childProcess2)
            } else {
              console.error('Error starting server')
            }
          } else {
            process.stdout.write(data)
          }
        })
      })

      childProcess.stderr.on('data', (data) => {
        if (childProcess2) {
          kill(childProcess2.pid)
          childProcess2 = null
        }
        spinner.stop()
        process.stdout.write(data)
      })

      childProcess.on('error', (data) => {
        if (childProcess2) {
          kill(childProcess2.pid)
          childProcess2 = null
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
} else if (options.test) {
  spinner = ora('Compiling...')
  spinner.start()
  const compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile`)
  printProcessData(compileProcess)

  compileProcess.on('exit', () => {
    spinner.text = 'Starting...'
    if (fs.existsSync('./compile/index.js')) {
      const testProcess = exec(' jest --colors')
      printProcessData(testProcess)
    }
  })
} else if (options.build) {
  spinner = ora('Compiling...')
  spinner.start()
  const compileProcess = exec(`cross-env SUMMER_ENV=${options.env} summer-compile`)
  printProcessData(compileProcess)
  compileProcess.on('exit', (code) => {
    if (fs.existsSync('./compile/index.js')) {
      if (fs.existsSync('./resource')) {
        fs.rmdirSync('./build', { recursive: true })
        fs.mkdirSync('./build')
        copyRecursiveSync('./resource', './build/resource')
      }
      const buildProcess = exec(
        'npx esbuild ./compile/index.js --bundle --sourcemap  --minify-whitespace  --platform=node --outfile=./build/index.js'
      )
      printProcessData(buildProcess)
    }
    spinner.stop()
  })
}

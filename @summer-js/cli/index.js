#!/usr/bin/env node

import { exec, execSync, spawn } from 'child_process'
import kill from 'tree-kill'
import crypto from 'crypto'
import fs from 'fs'
import { program } from 'commander'
import chokidar from 'chokidar'
import ora from 'ora'

program.option('-t, --test').option('-s, --serve').option('-b, --build').option('--env [char]', '', '')
program.parse()

const options = program.opts()

const clearScreen = () => process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')

let spinner

const printProcessData = (p) => {
  p.stdout.on('data', (data) => {
    spinner.stop()
    process.stdout.write(data)
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

let serveStared = false
if (options.serve) {
  const fileHashes = {}
  let childProcess = null
  let childProcess2 = null
  spinner = ora('Compiling...')

  const serve = () => {
    try {
      clearScreen()
      spinner.start()

      if (childProcess) {
        kill(childProcess.pid)
        childProcess = null
      }

      childProcess = exec(`rm -rdf ./compile/* && cross-env SUMMER_ENV=${options.env} summer-compile`)

      printProcessData(childProcess)

      childProcess.on('exit', () => {
        serveStared = true

        if (childProcess2) {
          kill(childProcess2.pid)
          childProcess2 = null
        }

        if (!fs.existsSync('./compile/index.js')) {
          return
        }
        childProcess2 = spawn('node', ['--enable-source-maps', './compile/index.js'])
        printProcessData(childProcess2)
      })
    } catch (e) {
      console.log(e)
    }
  }

  serve()

  const watchDir = './src/'
  chokidar.watch(watchDir, { ignored: 'src/auto-imports.ts' }).on('all', (event, path) => {
    if (fs.existsSync('./' + path)) {
      if (fs.lstatSync('./' + path).isDirectory()) {
        return
      }
      const md5 = crypto.createHash('md5')
      const currentMD5 = md5.update(fs.readFileSync('./' + path).toString()).digest('hex')
      if (!fileHashes[path] && !serveStared) {
        fileHashes[path] = currentMD5
        return
      }
      if (currentMD5 === fileHashes[path]) {
        return
      }

      fileHashes[path] = currentMD5
    } else {
      delete fileHashes[path]
    }
    serve()
  })
} else if (options.test) {
  spinner = ora('Preparing...')
  spinner.start()
  const compileProcess = exec(`rm -rdf ./compile/* && cross-env SUMMER_ENV=${options.env} summer-compile`)
  printProcessData(compileProcess)

  compileProcess.on('exit', () => {
    spinner.stop()
    if (fs.existsSync('./compile/index.js')) {
      const testProcess = exec(' jest --colors')
      printProcessData(testProcess)
    }
  })
} else if (options.build) {
  spinner = ora('Building ...')
  spinner.start()
  const compileProcess = exec(`rm -rdf ./compile/* && cross-env SUMMER_ENV=${options.env} summer-compile`)
  printProcessData(compileProcess)
  compileProcess.on('exit', (code) => {
    if (fs.existsSync('./compile/index.js')) {
      if (fs.existsSync('./resource')) {
        if (!fs.existsSync('./build')) {
          fs.mkdirSync('./build')
        }
        if (!fs.existsSync('./build/resource')) {
          fs.mkdirSync('./build/resource')
        }
        exec('cp -r ./resource/* ./build/resource')
      }
      spinner.stop()
      const buildProcess = exec(
        'npx esbuild ./compile/index.js --bundle --sourcemap --platform=node --outfile=./build/index.js'
      )
      printProcessData(buildProcess)
    }
    spinner.stop()
  })
}

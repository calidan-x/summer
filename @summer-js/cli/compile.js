#!/usr/bin/env node

import fs from 'fs'
import crypto from 'crypto'
import chokidar from 'chokidar'
import path from 'path'
import { Project, ClassDeclaration } from 'ts-morph'
import { execSync } from 'child_process'

const listen = process.argv[2] === 'listen'

let PLUGINS = []

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
})

let dirty = false
let firstCompile = true
let compiling = false
const updateFileList = []
const compile = async () => {
  dirty = false
  compiling = true
  const pluginIncs = []
  const existPlugins = {}

  console.log('COMPILE_START')

  for (const { event, updatePath } of updateFileList) {
    if (['add'].includes(event)) {
      project.addSourceFilesAtPaths(updatePath)
    }
    if (['unlink'].includes(event)) {
      try {
        project.removeSourceFile(project.getSourceFileOrThrow(updatePath))
      } catch (e) {}
    }
  }

  fs.writeFileSync('./src/auto-imports.ts', '')
  project.getSourceFileOrThrow('./src/auto-imports.ts').refreshFromFileSystemSync()

  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error compiling source code:')
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
    return
  }

  if (dirty && !firstCompile) {
    compile()
    return
  }

  const sourceFiles = project.getSourceFiles()

  const getDeclareType = (declareLine, isArray) => {
    const parts = declareLine.split(/:(.*)/s)
    let type = undefined
    if (parts.length > 1) {
      type = parts[1].replace(';', '').replace(/=.+$/, '').trim()
    }
    if (isArray) {
      type = type.replace('[]', '')
    }

    if (type === 'any' || type === 'undefined' || type === 'null' || !Number.isNaN(Number(type))) {
      type = undefined
    }

    if (['number', 'string', 'boolean', 'int', 'float'].includes(type)) {
      type = type.replace(/^(.)/, (matched, index, original) => matched.toUpperCase())
    }

    if (type === 'bigint') {
      type = 'BigInt'
    }

    if (typeof type === 'string' && type.indexOf('|') > 0) {
      const eachStrings = type.split('|')
      let stringEnum = '{'
      eachStrings.forEach((es) => {
        es = es.trim()
        if ((es.startsWith('"') && es.endsWith('"')) || (es.startsWith("'") && es.endsWith("'"))) {
          stringEnum += es + ':' + es + ','
        }
      })
      stringEnum = stringEnum.replace(/,$/, '')
      stringEnum += '}'
      return stringEnum
    }

    return type
  }

  const addPropDecorator = (cls) => {
    if (!cls) {
      return
    }
    cls.getProperties().forEach((p) => {
      let type = getDeclareType(p.getText(), p.getType().isArray())
      if (type === undefined || type === null) {
        return
      }

      if (!p.hasQuestionToken()) {
        if (!p.getDecorators().find((d) => d.getName() === '_Required')) {
          p.addDecorator({ name: '_Required', arguments: [] })
        }
      }
      if (!p.getDecorators().find((d) => d.getName() === '_PropDeclareType')) {
        p.addDecorator({ name: '_PropDeclareType', arguments: [type] })
      }
    })
    if (cls.getExtends()) {
      addPropDecorator(cls.getExtends().getExpression().getType().getSymbolOrThrow().getDeclarations()[0])
    }
  }

  let importFilesList = []

  for (const sf of sourceFiles) {
    ;['default.config.ts', process.env.SUMMER_ENV + '.config.ts'].forEach((configFileName) => {
      if (sf.getFilePath().indexOf(configFileName) > 0) {
        const refSourceFiles = sf.getReferencedSourceFiles()
        refSourceFiles.forEach((refSourceFile) => {
          if (refSourceFile.getText().indexOf('SummerPlugin') > 0) {
            const found = refSourceFile.getFilePath().match(/@summer-js\/[^/]+/)
            if (found) {
              if (found[0] !== '@summer-js/summer') {
                PLUGINS.push(found[0])
              }
            }
          }
        })
      }
    })
  }

  PLUGINS = Array.from(new Set(PLUGINS))
  importFilesList.push(...PLUGINS)

  for (const plugin of PLUGINS) {
    if (fs.existsSync('./node_modules/' + plugin) || fs.existsSync('../../node_modules/' + plugin)) {
      const p = await import(plugin)
      const P = p.default.default
      pluginIncs.push(new P())
      existPlugins[plugin.replace(/[/-]/g, '').replace(/@/g, '')] = plugin
    }
  }

  for (const sf of sourceFiles) {
    sf.refreshFromFileSystemSync()
    for (const cls of sf.getClasses()) {
      addPropDecorator(cls)
      for (const classDecorator of cls.getDecorators()) {
        if (classDecorator.getName() === 'Controller' || classDecorator.getName() === 'Middleware') {
          importFilesList.push(
            cls
              .getSourceFile()
              .getFilePath()
              .replace(path.resolve() + '/src', '.')
          )
          cls.getMethods().forEach((cMethod) => {
            cMethod.getParameters().forEach((param) => {
              if (param.getDecorators().length > 0) {
                const paramType = param.getType()
                param.addDecorator({
                  name: '_ParamDeclareType',
                  arguments: [getDeclareType(param.getText(), paramType.isArray())]
                })
              }
            })
          })
        }

        for (const p of pluginIncs) {
          p.compile && (await p.compile(classDecorator, cls))
        }
      }
    }
  }

  let fileContent = '// this file is generated by compiler\n'
  fileContent += 'process.env.SUMMER_ENV = "' + (process.env.SUMMER_ENV || '') + '"\n'

  if (fs.existsSync('./src/config/default.config.ts')) {
    if (fs.readFileSync('./src/config/default.config.ts', { encoding: 'utf-8' }).trim().length > 0) {
      fileContent += 'import * as defaultConfig from "./config/default.config"\n'
      fileContent += 'global["$$_DEFAULT_CONFIG"] = defaultConfig\n'
    }
  }

  if (fs.existsSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`)) {
    if (fs.readFileSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`, { encoding: 'utf-8' }).trim().length > 0) {
      fileContent += `import * as envConfig from "./config/${process.env.SUMMER_ENV}.config";\n`
      fileContent += 'global["$$_ENV_CONFIG"] = envConfig\n'
    }
  }

  importFilesList.forEach((path, inx) => {
    fileContent += `import '${path.replace(/\.ts$/, '')}'\n`
  })

  fileContent += '\n'

  for (const p of pluginIncs) {
    fileContent += p.getAutoImportContent ? p.getAutoImportContent() + '\n' : ''
  }

  if (dirty && !firstCompile) {
    compile()
    return
  }

  fs.writeFileSync('./src/auto-imports.ts', fileContent)
  project.getSourceFileOrThrow('./src/auto-imports.ts').refreshFromFileSystemSync()
  project.resolveSourceFileDependencies()
  execSync('rm -rdf ./compile/*')
  project.emitSync()

  for (const p of pluginIncs) {
    p.postCompile && (await p.postCompile())
  }

  firstCompile = false

  if (dirty) {
    compile()
  } else {
    updateFileList.splice(0, updateFileList.length)
    console.log('COMPILE_DONE')
  }

  compiling = false
}

if (listen) {
  const fileHashes = {}
  const watchDir = './src/'
  const watcher = chokidar.watch(watchDir, { ignored: 'src/auto-imports.ts' }).on('all', async (event, path) => {
    if (fs.existsSync('./' + path)) {
      if (fs.lstatSync('./' + path).isDirectory()) {
        return
      }
      const md5 = crypto.createHash('md5')
      const currentMD5 = md5.update(fs.readFileSync('./' + path).toString()).digest('hex')

      if (!fileHashes[path] && firstCompile) {
        fileHashes[path] = currentMD5
        return
      }

      // if (currentMD5 === fileHashes[path]) {
      //   return
      // }

      fileHashes[path] = currentMD5
    } else {
      delete fileHashes[path]
    }
    updateFileList.push({ event, updatePath: path })
    dirty = true
    if (compiling || firstCompile) {
      return
    }
    await compile()
  })

  watcher.on('ready', async () => {
    await compile()
  })
} else {
  compile()
}

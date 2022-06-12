#!/usr/bin/env node

// @ts-check
import fs from 'fs'
import crypto from 'crypto'
import chokidar from 'chokidar'
import path from 'path'
import { Project, VariableDeclarationKind } from 'ts-morph'

const watch = process.argv[2] === 'watch'

let PLUGINS = []

fs.rmSync('./compile', { recursive: true, force: true })
fs.mkdirSync('./compile')

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
})

const getAllReferencingSourceFiles = (sf, allRefFiles) => {
  if (!sf) {
    return
  }
  allRefFiles.push(sf)
  const refFiles = sf.getReferencingSourceFiles()
  for (const refFile of refFiles) {
    if (allRefFiles.includes(refFile)) {
      continue
    }
    getAllReferencingSourceFiles(refFile, allRefFiles)
  }
}

let firstCompile = true
let compiling = false
const updateFileList = []
const compile = async () => {
  compiling = true
  const pluginIncs = []

  console.log('COMPILE_START')

  const dirtyFiles = []
  for (const { event, updatePath } of updateFileList) {
    if (['add', 'change'].includes(event)) {
      getAllReferencingSourceFiles(project.getSourceFile(path.resolve(updatePath)), dirtyFiles)
      project.resolveSourceFileDependencies()
    }
    if (['add'].includes(event)) {
      project.addSourceFilesAtPaths(updatePath)
    }
    if (['unlink'].includes(event)) {
      try {
        project.removeSourceFile(project.getSourceFileOrThrow(updatePath))
      } catch (e) {}
    }
  }

  const sourceFiles = project.getSourceFiles()

  const TypeMapping = {
    number: 'Number',
    string: 'String',
    boolean: 'Boolean',
    int: '_Int',
    bigint: 'BigInt',
    Date: 'Date',
    DateTime: '_DateTime',
    TimeStamp: '_TimeStamp',
    any: 'undefined',
    'number[]': 'Number',
    'string[]': 'String',
    'boolean[]': 'Boolean',
    'int[]': '_Int',
    'bigint[]': 'BigInt',
    'Date[]': 'Date',
    'DateTime[]': '_DateTime',
    'TimeStamp[]': '_TimeStamp',
    'any[]': 'undefined',
    undefined: 'undefined',
    null: 'undefined'
  }

  const getCompileType = (type, p) => {
    if (!type) {
      return 'undefined'
    }
    if (type.isArray()) {
      return 'Array'
    } else if (type.isClass()) {
      return type.getText(p)
    }

    return TypeMapping[type.getText(p)] || 'undefined'
  }

  const getDeclareType = (declareLine, parameter, paramType) => {
    const parts = declareLine.split(/:([^:]*)$/s)
    let type = 'undefined'
    if (parts.length > 1) {
      type = parts[1]
        .replace(';', '')
        .replace(/[^=]=.+$/, '')
        .trim()
    }

    if (TypeMapping[type]) {
      return TypeMapping[type]
    }

    if (!paramType) {
      paramType = parameter.getType()
    }
    if (!paramType) {
      return 'undefined'
    }

    if (paramType.isUnion() && !paramType.isEnum() && !paramType.isBoolean()) {
      const unionTypes = paramType.getUnionTypes()
      const enumJSON = {}
      for (const ut of unionTypes) {
        if (ut.isStringLiteral()) {
          const suv = ut.getText().replace(/^['"]/, '').replace(/['"]$/, '')
          enumJSON[suv] = suv
        } else {
          return undefined
        }
      }
      return JSON.stringify(enumJSON)
    } else if (paramType.isArray()) {
      type = type.replace('[]', '')
      const pType = paramType.getArrayElementTypeOrThrow()
      if (pType.isClass() || pType.isEnum()) {
      } else {
        type = TypeMapping[type]
      }
    } else if (paramType.isStringLiteral()) {
      let stringText = paramType.getText(parameter).trim()
      stringText = stringText.substring(1, stringText.length - 1)
      return JSON.stringify({ [stringText]: stringText })
    } else if (paramType.isClass() || paramType.isEnum()) {
    } else {
      type = TypeMapping[type]
    }

    return type
  }

  const addPropDecorator = (cls) => {
    if (!cls) {
      return
    }
    cls.getProperties().forEach((p) => {
      let type = getDeclareType(p.getText(), p)
      if (type === undefined || type === null) {
        return
      }

      const pendingDecorators = []
      if (!p.hasQuestionToken()) {
        if (!p.getDecorators().find((d) => d.getName() === '_Required')) {
          pendingDecorators.push({ name: '_Required', arguments: [] })
        }
      }

      if (!p.getDecorators().find((d) => d.getName() === '_PropDeclareType')) {
        pendingDecorators.push({ name: '_PropDeclareType', arguments: [type] })
      }

      if (pendingDecorators.length) {
        p.addDecorators(pendingDecorators)
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
    }
  }

  const autoImportDecorators = ['Middleware', 'Controller', 'RpcProvider', 'RpcClient']
  for (const p of pluginIncs) {
    if (p.autoImportDecorators) {
      const aids = p.autoImportDecorators()
      autoImportDecorators.push(...aids)
    }
  }

  let compileCounter = 0
  for (const sf of sourceFiles) {
    compileCounter++

    if (sf.getFilePath().endsWith('.d.ts') || (watch && sf.getFilePath().endsWith('.test.ts'))) {
      continue
    }

    // add import file list
    for (const cls of sf.getClasses()) {
      for (const classDecorator of cls.getDecorators()) {
        if (autoImportDecorators.includes(classDecorator.getName())) {
          importFilesList.push(
            cls
              .getSourceFile()
              .getFilePath()
              .replace(path.resolve() + '/src', '.')
          )
        }
      }
    }

    if (!firstCompile && !dirtyFiles.includes(sf)) {
      continue
    }

    sf.refreshFromFileSystemSync()
    for (const cls of sf.getClasses()) {
      addPropDecorator(cls)
      for (const classDecorator of cls.getDecorators()) {
        if (classDecorator.getName() === 'Controller') {
          cls.getMethods().forEach((cMethod) => {
            cMethod.getParameters().forEach((param) => {
              if (param.getDecorators().length > 0) {
                param.addDecorator({
                  name: '_ParamDeclareType',
                  arguments: [getDeclareType(param.getText(), param)]
                })
              }
            })
          })
        } else if (classDecorator.getName() === 'RpcClient') {
          const pendingProperties = []
          const pendingMethods = []
          cls.getProperties().forEach((p) => {
            if (p.getType().isAnonymous()) {
              const callSignature = p.getType().getCallSignatures()[0]
              pendingProperties.push(p)

              const returnPromiseType = callSignature.getReturnType().getTypeArguments()[0]

              pendingMethods.push({
                name: p.getName(),
                returnType: callSignature.getReturnType().getText(p),
                parameters: callSignature.getParameters().map((param, inx) => ({
                  name: param.getName(),
                  type: callSignature.getParameters()[inx].getDeclarations()[0].getType().getText(p)
                })),
                statements: 'return {} as Promise<any>',
                decorators: [
                  {
                    name: '_ReturnDeclareType',
                    arguments: [
                      getCompileType(returnPromiseType, p),
                      getDeclareType(':' + (returnPromiseType ? returnPromiseType.getText() : ''), p, returnPromiseType)
                    ]
                  }
                ]
              })
            }
          })
          cls.addMethods(pendingMethods)
          pendingProperties.forEach((p) => {
            p.remove()
          })
        }
      }

      if (cls.getDecorators().length > 0) {
        for (const classProperty of cls.getMethods()) {
          for (const cpd of classProperty.getDecorators()) {
            if (cpd.getName() === 'Send') {
              const callSignature = classProperty.getType().getCallSignatures()[0]
              const returnPromiseType = callSignature.getReturnType().getTypeArguments()[0]
              classProperty.addDecorators([
                {
                  name: '_ReturnDeclareType',
                  arguments: [
                    getCompileType(returnPromiseType, classProperty),
                    getDeclareType(
                      ':' + (returnPromiseType ? returnPromiseType.getText() : ''),
                      classProperty,
                      returnPromiseType
                    )
                  ]
                }
              ])
            }
          }
        }
      }

      for (const p of pluginIncs) {
        p.compile && (await p.compile(cls))
        for (const classDecorator of cls.getDecorators()) {
          if (autoImportDecorators.includes(classDecorator.getName())) {
            importFilesList.push(
              cls
                .getSourceFile()
                .getFilePath()
                .replace(path.resolve() + '/src', '.')
            )
          }
        }
      }
    }

    console.log('COMPILE_PROGRESS(' + compileCounter + '/' + sourceFiles.length + ')')
  }

  console.log('COMPILE_PROGRESS(' + sourceFiles.length + '/' + sourceFiles.length + ')')

  const statements = []
  statements.push('process.env.SUMMER_ENV = "' + (process.env.SUMMER_ENV || '') + '"\n')

  if (fs.existsSync('./src/config/default.config.ts')) {
    if (fs.readFileSync('./src/config/default.config.ts', { encoding: 'utf-8' }).trim().length > 0) {
      const defaultConfigSourceFile = project.getSourceFileOrThrow('./src/config/default.config.ts')
      defaultConfigSourceFile.refreshFromFileSystem()
      defaultConfigSourceFile.addStatements('global["$$_DEFAULT_CONFIG"] = exports')

      statements.push('import "./config/default.config"\n')
    }
  }
  if (fs.existsSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`)) {
    if (fs.readFileSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`, { encoding: 'utf-8' }).trim().length > 0) {
      const envConfigSourceFile = project.getSourceFileOrThrow(`./src/config/${process.env.SUMMER_ENV}.config.ts`)
      envConfigSourceFile.refreshFromFileSystem()
      envConfigSourceFile.addStatements('global["$$_ENV_CONFIG"] = exports')

      statements.push(`import "./config/${process.env.SUMMER_ENV}.config";\n`)
    }
  }

  Array.from(new Set(importFilesList)).forEach((path) => {
    statements.push('import "' + path.replace(/\.ts$/, '') + '"')
  })

  const indexSourceFile = project.getSourceFileOrThrow('src/index.ts')
  indexSourceFile.refreshFromFileSystem()
  indexSourceFile.insertStatements(0, statements)

  project.resolveSourceFileDependencies()

  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error compiling source code:')
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
    compiling = false
    firstCompile = false
    return
  }

  project.emitSync()

  for (const p of pluginIncs) {
    p.postCompile && (await p.postCompile())
  }

  firstCompile = false
  updateFileList.splice(0, updateFileList.length)
  console.log('COMPILE_DONE')
  compiling = false
}

if (watch) {
  const fileHashes = {}
  const watchDir = './src/'
  const watcher = chokidar
    .watch(watchDir, {
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 100 }
    })
    .on('all', async (event, path) => {
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

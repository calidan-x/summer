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

const TypeMapping = {
  number: '[Number]',
  string: '[String]',
  boolean: '[Boolean]',
  int: '[_Int]',
  bigint: '[BigInt]',
  Date: '[Date]',
  DateTime: '[_DateTime]',
  TimeStamp: '[_TimeStamp]',
  any: '[]',
  'number[]': '[Number,Array]',
  'string[]': '[String,Array]',
  'boolean[]': '[Boolean,Array]',
  'int[]': '[_Int,Array]',
  'bigint[]': '[BigInt,Array]',
  'Date[]': '[Date,Array]',
  'DateTime[]': '[_DateTime,Array]',
  'TimeStamp[]': '[_TimeStamp,Array]',
  'any[]': '[undefined,Array]',
  undefined: '[]',
  null: '[]',
  void: '[]'
}

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

const addFileImport = (typeString, clazz) => {
  if (typeString && typeString.startsWith('import("')) {
    const importParts = typeString.split('.')
    const importName = importParts[importParts.length - 1].replace(/\[\]$/, '')
    const imports = clazz.getSourceFile().getImportDeclarations()
    let imported = false
    imports.forEach((ipt) => {
      ipt.getNamedImports().forEach((ni) => {
        if (ni.getText() === importName) {
          imported = true
        }
      })
    })

    if (!imported) {
      clazz.getSourceFile().addImportDeclaration({
        namedImports: [importName],
        moduleSpecifier:
          './' +
          path.relative(
            path.dirname(clazz.getSourceFile().getFilePath()),
            JSON.parse('"' + typeString.substring(8).replace(/"\)\..+$/, '') + '"') + '\n'
          )
      })
    }
  }
}

// [0, Array,[]]
// [String, Array,[]]
// [{e1:12,e2:33}, undefined,[]]
// [["val1","val2"], undefined,[]]

// class A<T>{
//   a:T[]
//   b:GG<gg>
// }

const getDeclareType = (declareLine, parameter, paramType, typeParams) => {
  // interface
  if (declareLine.startsWith(':{')) {
    return '[]'
  }

  const parts = declareLine.split(/:([^:]*)$/s)
  let type = '[]'
  if (parts.length > 1) {
    type = parts[1]
      .replace(';', '')
      .replace(/[^=]=.+$/, '')
      .trim()
    // Basic Type
    if (TypeMapping[type]) {
      return TypeMapping[type]
    }
  } else {
    return '[]'
  }

  // Generic
  if (typeParams && typeParams.length > 0) {
    const typeWithoutArray = type.replace('[]', '')
    const tpInx = typeParams.findIndex((tp) => tp === typeWithoutArray)
    if (tpInx >= 0) {
      if (type.endsWith('[]')) {
        return '[' + tpInx + ',Array]'
      }
      return '[' + tpInx + ']'
    }
  }

  if (!paramType) {
    paramType = parameter.getType()
    if (paramType.isInterface()) {
      return '[]'
    }
    if (!paramType.isStringLiteral()) {
      paramType = paramType.getApparentType()
    }
  }
  if (!paramType) {
    return '[]'
  }

  if (declareLine.indexOf('<') > 0) {
    const baseType = paramType.getText(parameter).replace(/<.+>/, '').replace('[]', '')
    const typeArgs = paramType
      .getTypeArguments()
      .map((tArg) => {
        addFileImport(tArg.getText(parameter), parameter)
        return getDeclareType(':' + tArg.getText(parameter), parameter, tArg)
      })
      .join(',')

    if (paramType.isArray()) {
      return `[${baseType},Array,[${typeArgs}]]`
    } else {
      return `[${baseType},undefined,[${typeArgs}]]`
    }
  }

  if (paramType.isArray()) {
    type = type.replace('[]', '')
    const pType = paramType.getArrayElementTypeOrThrow()
    if (pType.isClass() || pType.isEnum()) {
      return `[${type},Array]`
    } else {
      type = TypeMapping[type]
    }
  } else if (paramType.isUnion() && !paramType.isEnum() && !paramType.isBoolean()) {
    const unionTypes = paramType.getUnionTypes()
    const unionArr = []
    for (const ut of unionTypes) {
      if (ut.isStringLiteral()) {
        const suv = ut.getText()
        unionArr.push(suv.replace(/['"]/g, ''))
      } else if (ut.isNumberLiteral()) {
        const suv = ut.getText()
        unionArr.push(Number(suv))
      } else {
        return '[]'
      }
    }
    return `[${JSON.stringify(unionArr)}]`
  } else if (paramType.isStringLiteral() || paramType.isNumberLiteral()) {
    return `[[${paramType.getText()}]]`
  } else if (paramType.isClass() || paramType.isEnum()) {
    return `[${type}]`
  } else {
    type = TypeMapping[type]
  }

  return type
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

  const addPropDecorator = (cls) => {
    if (!cls) {
      return
    }

    const typeParameters = cls.getTypeParameters().map((tp) => tp.getText(cls))
    cls.getProperties().forEach((p) => {
      let type = getDeclareType(p.getText(), p, undefined, typeParameters)
      if (type === undefined || type === null) {
        return
      }

      const pendingDecorators = []
      if (p.hasQuestionToken()) {
        if (!p.getDecorators().find((d) => d.getName() === '_Optional')) {
          pendingDecorators.push({ name: '_Optional', arguments: [] })
        }
      } else if (p.hasExclamationToken()) {
        if (!p.getDecorators().find((d) => d.getName() === '_NotEmpty')) {
          pendingDecorators.push({ name: '_NotEmpty', arguments: [] })
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
            if (cMethod.getDecorators().length > 0) {
              cMethod.getParameters().forEach((param) => {
                if (param.getDecorators().length > 0) {
                  const decorators = [
                    {
                      name: '_ParamDeclareType',
                      arguments: [getDeclareType(param.getText(), param)]
                    }
                  ]
                  if (param.hasQuestionToken()) {
                    decorators.push({
                      name: '_Optional',
                      arguments: []
                    })
                  }
                  param.addDecorators(decorators)
                }
              })

              /// return type
              let returnType = cMethod.getReturnType()
              let returnTypeStr = returnType.getText(cls)
              if (returnTypeStr.startsWith('Promise<')) {
                returnType = returnType.getTypeArguments()[0]
                returnTypeStr = returnType.getText(cls)
              }
              addFileImport(returnTypeStr, cls)
              returnTypeStr = returnType.getText(cls)

              cMethod.addDecorator({
                name: '_ReturnDeclareType',
                arguments: [getDeclareType(':' + returnTypeStr, cls, returnType)]
              })
            }
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
                      getDeclareType(
                        ':' + (returnPromiseType ? returnPromiseType.getText(cls) : ''),
                        p,
                        returnPromiseType
                      )
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

      // RPC
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
                    getDeclareType(
                      ':' + (returnPromiseType ? returnPromiseType.getText(cls) : ''),
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

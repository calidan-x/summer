#!/usr/bin/env node

// @ts-check
import fs from 'fs'
import crypto from 'crypto'
import chokidar from 'chokidar'
import path from 'path'
import { Project, ClassDeclaration, EnumDeclaration } from 'ts-morph'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const summerPackage = JSON.parse(fs.readFileSync(__dirname + '/../summer/package.json', { encoding: 'utf-8' }))

const watch = process.argv[2] === 'watch'

let PLUGINS = []

fs.rmSync('./compile', { recursive: true, force: true })
fs.mkdirSync('./compile')

const project = new Project({
  tsConfigFilePath: './tsconfig.json'
})

const slash = (path) => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path)
  if (isExtendedLengthPath || hasNonAscii) {
    return path
  }
  return path.replace(/\\/g, '/')
}

const TypeMapping = {
  number: '[Number]',
  string: '[String]',
  boolean: '[Boolean]',
  int: '[_Int]',
  bigint: '[BigInt]',
  Date: '[Date]',
  any: '[]',
  'number[]': '[Number,Array]',
  'string[]': '[String,Array]',
  'boolean[]': '[Boolean,Array]',
  'int[]': '[_Int,Array]',
  'bigint[]': '[BigInt,Array]',
  'Date[]': '[Date,Array]',
  'any[]': '[undefined,Array]',
  undefined: '[]',
  null: '[]',
  void: '[]'
}

const getAllReferencingSourceFiles = (sf, allRefFiles) => {
  if (!sf) {
    return
  }
  if (!allRefFiles.includes(sf)) {
    allRefFiles.push(sf)
    sf.getExportSymbols().forEach((es) => {
      es.getDeclarations().forEach((d) => {
        try {
          // @ts-ignore
          d.findReferencesAsNodes().forEach((node) => {
            const refSourceFile = node.getSourceFile()
            if (allRefFiles.includes(refSourceFile)) {
              return
            }
            getAllReferencingSourceFiles(refSourceFile, allRefFiles)
          })
        } catch (e) {}
      })
    })
  }
}

const addFileImport = (typeString, clazz) => {
  if (typeString && typeString.indexOf('import("') >= 0) {
    let statement = ''
    while (true) {
      const importReg = /import\("([^"]+)"\)\.([^<^>^\[^\]]+)/
      const result = importReg.exec(typeString)
      if (!result) {
        break
      }

      typeString = typeString.replace(importReg, '')

      const importName = result[2]
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
        const importFilePath =
          './' +
          slash(
            path.relative(path.dirname(slash(clazz.getSourceFile().getFilePath())), JSON.parse('"' + result[1] + '"'))
          )
        statement += `import { ${importName} } from '${importFilePath}';`
      }
    }

    if (statement) {
      clazz
        .getSourceFile()
        .getImportDeclarations()[0]
        .replaceWithText(statement + clazz.getSourceFile().getImportDeclarations()[0].getText())
    }
  }
}

let ALLTypeMapping = {}
const addPropDecorator = (cls) => {
  if (!cls) {
    return
  }

  ALLTypeMapping = { ...TypeMapping }

  const typeParameters = cls.getTypeParameters().map((tp) => tp.getText(cls))
  cls.getProperties().forEach((p) => {
    let type = getDeclareType(p.getText(), p, undefined, typeParameters)
    const pendingDecorators = []

    const match = p.getText().match(/EnvConfig *< *['"]([^'^"]+)['"]/)
    if (match) {
      pendingDecorators.push({ name: '_EnvConfig', arguments: ["'" + match[1]] + "'" })
    }

    if (type === undefined || type === null) {
      if (!p.getDecorators().find((d) => d.getName() === '_PropDeclareType')) {
        pendingDecorators.push({ name: '_PropDeclareType', arguments: [] })
      }
    } else {
      if (p.hasQuestionToken() || p.hasInitializer()) {
        if (!p.getDecorators().find((d) => d.getName() === '_Optional')) {
          pendingDecorators.push({ name: '_Optional', arguments: [] })
        }
      }

      if (p.hasExclamationToken()) {
        if (!p.getDecorators().find((d) => d.getName() === '_NotBlank')) {
          pendingDecorators.push({ name: '_NotBlank', arguments: [] })
        }
      }

      if (!p.getDecorators().find((d) => d.getName() === '_PropDeclareType')) {
        pendingDecorators.push({ name: '_PropDeclareType', arguments: [type] })
      }
    }

    if (pendingDecorators.length) {
      modifyActions.push(() => {
        p.addDecorators(pendingDecorators)
        p.replaceWithText(
          p
            .getText()
            .replace(/(@_Optional[^\n]+)\n/g, '$1 ')
            .replace(/(@_PropDeclareType[^\n]+)\n/g, '$1 ')
            .replace(/(@_NotBlank[^\n]+)\n/g, '$1 ')
            .replace(/(@_Optional[^\n]+)\n/g, '$1 ')
            .replace(/(@_EnvConfig[^\n]+)\n/g, '$1 ')
        )
      })
    }
  })
}

// [0, Array,[]]
// [String, Array,[]]
// [{e1:12,e2:33}, undefined,[]]
// [["val1","val2"], undefined,[]]

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

    if (/^Array<.+>$/.test(type)) {
      type = type.replace(/^Array</, '').replace(/>$/, '') + '[]'
      declareLine = type
    }

    // Basic Type
    if (ALLTypeMapping[type]) {
      return ALLTypeMapping[type]
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
    paramType = paramType.getNonNullableType()

    if (paramType.isInterface()) {
      return '[]'
    }
    if (!paramType.isStringLiteral()) {
      paramType = paramType.getApparentType()
    }
  }

  if (!paramType || paramType.isAnonymous()) {
    return '[]'
  }

  if (declareLine.indexOf('<') > 0) {
    const baseType = paramType.getText(parameter).replace(/<.+>/, '').replace('[]', '')
    const typeArgs = paramType
      .getTypeArguments()
      .map((tArg, inx) => {
        if (!(tArg.getText(parameter).indexOf('<') > 0 && tArg.getTargetType && tArg.getTargetType()?.isInterface())) {
          addFileImport(tArg.getText(parameter), parameter)
        }
        return getDeclareType(':' + tArg.getText(parameter), parameter, tArg, typeParams)
      })
      .join(',')

    try {
      const targetTarget = paramType.getTargetType()
      if (targetTarget.isClass()) {
        return `[${baseType},undefined,[${typeArgs}]]`
      } else if (paramType.isArray()) {
        const pType = paramType.getArrayElementTypeOrThrow()
        if (pType.isClass()) {
          return `[${baseType},Array,[${typeArgs}]]`
        } else {
          return '[]'
        }
      }
    } catch (e) {
      return '[]'
    }
  }

  if (paramType.isArray()) {
    type = type.replace(/\[\]$/, '')
    const pType = paramType.getArrayElementTypeOrThrow()
    if (pType.isClass() || pType.isEnum()) {
      return `[()=>${type},Array]`
    } else {
      type = TypeMapping[type]
    }
  } else if (paramType.isUnion() && !paramType.isEnum() && !paramType.isEnumLiteral() && !paramType.isBoolean()) {
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
  } else if (paramType.isClass() || paramType.isEnum() || paramType.isEnumLiteral()) {
    return `[()=>${paramType.getText(parameter)}]`
  } else if (paramType.isStringLiteral() || paramType.isNumberLiteral()) {
    return `[${paramType.getText(parameter)}]`
  } else {
    type = ALLTypeMapping[type]
  }

  return type
}

let modifyActions = []

const stripColor = (str) => {
  const isTerminal = process.env.TERM !== undefined
  if (isTerminal) {
    return str
  }
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')
}

const checkError = () => {
  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error compiling source code:')
    console.log(stripColor(project.formatDiagnosticsWithColorAndContext(diagnostics)))
    console.log('\x1b[33m%s\x1b[0m', '\nFound ' + diagnostics.length + ' Error' + (diagnostics.length > 1 ? 's' : ''))
    compiling = false
    return true
  }

  for (const sf of project.getSourceFiles()) {
    for (const cls of sf.getClasses()) {
      for (const classDecorator of cls.getDecorators()) {
        if (classDecorator.getName() === 'Controller') {
          for (const cMethod of cls.getMethods()) {
            let returnType = cMethod.getReturnType()
            let returnTypeStr = returnType.getText(cls)

            if (returnTypeStr.startsWith('Promise<')) {
              returnType = returnType.getTypeArguments()[0]
              returnTypeStr = returnType.getText(cls)
            }

            try {
              if (returnType.isArray()) {
                // @ts-ignore
                returnType = returnType.getArrayElementType()
              }
              if (returnType.isClass() || returnType.isEnum()) {
                const classDeclaration = returnType.getSymbol()?.getDeclarations()[0]
                // @ts-ignore
                if (!classDeclaration.isExported()) {
                  // @ts-ignore
                  classDeclaration.setIsExported(true)

                  returnType = cMethod.getReturnType()
                  returnTypeStr = returnType.getText(cls)

                  if (returnTypeStr.startsWith('Promise<')) {
                    returnType = returnType.getTypeArguments()[0]
                    returnTypeStr = returnType.getText(cls)
                  }
                }
              }
            } catch (e) {}

            if (returnTypeStr.indexOf('|') > 0) {
              console.error('\x1b[31m%s\x1b[0m', 'Error compiling source code:\n')
              console.error('\x1b[31m%s\x1b[0m', cls.getSourceFile().getFilePath())
              console.error(
                '\x1b[31m%s\x1b[0m',
                cls.getName() + '.' + cMethod.getName() + '()' + ' should return consistent type for api response'
              )
              console.error('\x1b[31m%s\x1b[0m', '# ' + returnTypeStr.replace(/import\("[^"]+"\)\./g, '') + '\n')
              console.error('\x1b[31m%s\x1b[0m', 'Or add "as any" to return type to ignore this error')
              compiling = false
            }

            if (!returnTypeStr.startsWith('{') && !returnType.isInterface()) {
              if (!(returnTypeStr.indexOf('<') > 0 && returnType.getTargetType()?.isInterface())) {
                modifyActions.push(() => {
                  addFileImport(returnTypeStr, cls)
                })
              }
            }
          }
        }
      }
    }
  }

  if (!compiling) {
    return true
  }

  return false
}

const resolvePath = (dirtyFiles, compileAll) => {
  if (Object.keys(project.getCompilerOptions().paths || {}).length === 0) {
    return []
  }
  const pathResolveActions = []
  for (const sf of project.getSourceFiles()) {
    if (sf.getFilePath().endsWith('.d.ts') || (!dirtyFiles.includes(sf) && !compileAll)) {
      continue
    }
    sf.getImportDeclarations().forEach((impt) => {
      const moduleSourceFile = impt.getModuleSpecifierSourceFile()
      if (moduleSourceFile) {
        if (
          moduleSourceFile.getFilePath().endsWith('.d.ts') ||
          moduleSourceFile.getFilePath().indexOf('node_modules') > 0 ||
          impt.isModuleSpecifierRelative()
        ) {
          return
        }

        pathResolveActions.push(() => {
          impt.setModuleSpecifier(
            './' +
              slash(path.relative(path.dirname(sf.getFilePath()), moduleSourceFile.getFilePath()).replace(/.ts$/, ''))
          )
        })
      }
    })
  }
  return pathResolveActions
}

let compiling = false
let isFirstCompile = true
const updateFileList = []
const compile = async (compileAll = false) => {
  compiling = true
  const pluginIncs = []
  modifyActions = []

  console.log('COMPILE_START')

  const dirtyFiles = []
  for (const { event, updatePath } of updateFileList) {
    if (['add', 'change'].includes(event)) {
      if (updatePath.endsWith('.ts')) {
        getAllReferencingSourceFiles(project.getSourceFile(path.resolve(updatePath)), dirtyFiles)
        project.resolveSourceFileDependencies()
      }
    }
    if (['add'].includes(event)) {
      if (updatePath.endsWith('.ts')) {
        project.addSourceFilesAtPaths(updatePath)
      }
    }
    if (['unlink'].includes(event)) {
      try {
        const unlinkSourceFile = project.getSourceFileOrThrow(updatePath)
        getAllReferencingSourceFiles(unlinkSourceFile, dirtyFiles)
        const inx = dirtyFiles.findIndex((sf) => sf === unlinkSourceFile)
        dirtyFiles.splice(inx, 1)
        project.removeSourceFile(unlinkSourceFile)
      } catch (e) {}
    }
  }

  let hasError = false
  dirtyFiles.forEach((df) => {
    try {
      df.refreshFromFileSystemSync()
    } catch (e) {
      hasError = true
    }
  })

  if (hasError) {
    compiling = false
    return
  }

  if (checkError()) {
    return
  }

  const pathResolveActions = resolvePath(dirtyFiles, compileAll)
  for (const action of pathResolveActions) {
    action()
  }

  modifyActions.forEach((action) => {
    action()
  })

  modifyActions = []
  updateFileList.splice(0, updateFileList.length)

  const sourceFiles = project.getSourceFiles()

  let importFilesList = []

  for (const sf of sourceFiles) {
    ;['default.config.ts', process.env.SUMMER_ENV + '.config.ts'].forEach((configFileName) => {
      if (sf.getFilePath().indexOf(configFileName) > 0) {
        const refSourceFiles = sf.getReferencedSourceFiles()
        refSourceFiles.forEach((refSourceFile) => {
          const found = slash(refSourceFile.getFilePath()).match(/@summer-js\/[^/]+/)
          if (found) {
            if (found[0] !== '@summer-js/summer') {
              PLUGINS.push(found[0])
            }
          } else {
            refSourceFile.getReferencedSourceFiles().forEach((refSf) => {
              const found = slash(refSf.getFilePath()).match(/@summer-js\/[^/]+/)
              if (found) {
                if (found[0] !== '@summer-js/summer') {
                  PLUGINS.push(found[0])
                }
              }
            })
          }
        })
      }
    })
  }

  PLUGINS = Array.from(new Set(PLUGINS))
  importFilesList.push(...PLUGINS)

  for (const plugin of PLUGINS) {
    try {
      const p = await import(plugin)
      const P = p.default.default
      pluginIncs.push(new P())
    } catch (e) {}
  }

  const autoImportDecorators = [
    'ClassCollect',
    'Service',
    'SocketIOController',
    'Injectable',
    'RpcProvider',
    'RpcClient',
    'Middleware',
    'Controller',
    'ErrorHandler'
  ]

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
          importFilesList.push('./' + slash(path.relative(path.resolve() + '/src', cls.getSourceFile().getFilePath())))
        }
      }
    }

    if (!dirtyFiles.includes(sf) && !compileAll) {
      continue
    }

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
                  if (param.hasQuestionToken() || param.hasInitializer()) {
                    decorators.push({
                      name: '_Optional',
                      arguments: []
                    })
                  }
                  modifyActions.push(() => {
                    param.addDecorators(decorators)
                  })
                }
              })

              /// return type
              let returnType = null
              let returnTypeStr = 'void'

              returnType = cMethod.getReturnType()
              returnTypeStr = returnType.getText(cls)

              if (returnTypeStr.startsWith('Promise<')) {
                returnType = returnType.getTypeArguments()[0]
                returnTypeStr = returnType.getText(cls)
              }

              returnTypeStr = returnType.getText(cls)
              const declareType = getDeclareType(':' + returnTypeStr, cls, returnType)

              modifyActions.splice(0, 0, () => {
                cMethod.addDecorator({
                  name: '_ReturnDeclareType',
                  arguments: [declareType]
                })
                cMethod.getChildren()[0].replaceWithText(
                  cMethod
                    .getChildren()[0]
                    .getText()
                    .replace(/\n[^\n]*@_ReturnDeclareType/g, ' @_ReturnDeclareType')
                )
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
              const params = callSignature.getParameters().map((param, inx) => ({
                name: param.getName(),
                type: callSignature.getParameters()[inx].getDeclarations()[0].getType().getText(p)
              }))

              pendingMethods.push({
                name: p.getName(),
                returnType: callSignature.getReturnType().getText(p),
                parameters: params,
                statements: [...params.map((p) => p.name), 'return {} as Promise<any>'],
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
          modifyActions.push(() => {
            cls.addMethods(pendingMethods)
            pendingProperties.forEach((p) => {
              p.remove()
            })
          })
        } else if (classDecorator.getName() === 'SocketIOController') {
          cls.getMethods().forEach((cMethod) => {
            if (cMethod.getDecorators().length > 0) {
              cMethod.getParameters().forEach((param, inx) => {
                if (inx === 1) {
                  const decorators = [
                    {
                      name: '_ParamDeclareType',
                      arguments: [getDeclareType(param.getText(), param)]
                    }
                  ]
                  modifyActions.push(() => {
                    param.addDecorators(decorators)
                  })
                }
              })
            }
          })
        }
      }

      for (const p of pluginIncs) {
        p.compile && (await p.compile(cls, modifyActions))
        p.getClassCollection().forEach((cls) => {
          importFilesList.push('./' + slash(path.relative(path.resolve() + '/src', cls.getSourceFile().getFilePath())))
        })
      }
    }
    console.log('COMPILE_PROGRESS [ ' + ((compileCounter * 150) / sourceFiles.length / 10).toFixed(0) + '% ]')
  }

  modifyActions.forEach((action, inx) => {
    console.log('COMPILE_PROGRESS [ ' + (((inx * 850) / modifyActions.length + 150) / 10).toFixed(0) + '% ]')
    action()
  })

  console.log('COMPILE_PROGRESS [ 100% ]')

  const statements = []
  statements.push(`process.env.SUMMER_VERSION = "${summerPackage.version}";`)
  statements.push(`process.env.SUMMER_ENV = "${process.env.SUMMER_ENV || ''}";`)
  statements.push(`process.env.SUMMER_BUILD_TIME = "${Date.now()}";`)

  if (fs.existsSync('./src/config/default.config.ts')) {
    if (fs.readFileSync('./src/config/default.config.ts', { encoding: 'utf-8' }).trim().length > 0) {
      const defaultConfigSourceFile = project.getSourceFileOrThrow('./src/config/default.config.ts')
      defaultConfigSourceFile.refreshFromFileSystemSync()
      defaultConfigSourceFile.addStatements('global["$$_DEFAULT_CONFIG"] = exports')

      statements.push('import "./config/default.config";')
    }
  }
  if (fs.existsSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`)) {
    if (fs.readFileSync(`./src/config/${process.env.SUMMER_ENV}.config.ts`, { encoding: 'utf-8' }).trim().length > 0) {
      const envConfigSourceFile = project.getSourceFileOrThrow(`./src/config/${process.env.SUMMER_ENV}.config.ts`)
      envConfigSourceFile.refreshFromFileSystemSync()
      envConfigSourceFile.addStatements('global["$$_ENV_CONFIG"] = exports')

      statements.push(`import "./config/${process.env.SUMMER_ENV}.config";`)
    }
  }

  Array.from(new Set(importFilesList)).forEach((path) => {
    statements.push('import "' + path.replace(/\.ts$/, '') + '";')
  })

  const indexSourceFile = project.getSourceFileOrThrow('src/index.ts')
  indexSourceFile.refreshFromFileSystemSync()
  indexSourceFile.getChildAtIndex(0).replaceWithText(statements.join('') + indexSourceFile.getChildAtIndex(0).getText())

  project.resolveSourceFileDependencies()

  if (updateFileList.length > 0) {
    compile()
    return
  }

  if (compileAll) {
    project.emitSync()
  } else {
    dirtyFiles.forEach((df) => {
      project.emitSync({ targetSourceFile: df })
    })
  }
  project.emitSync({ targetSourceFile: indexSourceFile })

  for (const p of pluginIncs) {
    p.postCompile && (await p.postCompile(isFirstCompile))
  }
  isFirstCompile = false

  console.log('COMPILE_DONE')
  compiling = false
}

let compileTimer = null
if (watch) {
  const fileHashes = {}
  const watchDir = './src/'
  chokidar
    .watch(watchDir, { awaitWriteFinish: { stabilityThreshold: 39, pollInterval: 100 } })
    .on('all', async (event, path) => {
      if (fs.existsSync('./' + path)) {
        if (fs.lstatSync('./' + path).isDirectory()) {
          return
        }
        const md5 = crypto.createHash('md5')
        const currentMD5 = md5.update(fs.readFileSync('./' + path).toString()).digest('hex')

        if (!fileHashes[path]) {
          fileHashes[path] = currentMD5
        } else if (currentMD5 === fileHashes[path]) {
          return
        }
        fileHashes[path] = currentMD5
      } else {
        delete fileHashes[path]
      }
      updateFileList.push({ event, updatePath: path })

      if (compileTimer) {
        clearTimeout(compileTimer)
      }
      compileTimer = setTimeout(async () => {
        compileTimer = null
        const timeStart = Date.now()
        await compile()
        // console.log(' Compile Time: ' + (Date.now() - timeStart) / 1000 + 's\n')
      }, 40)
    })
} else {
  compile(true)
}

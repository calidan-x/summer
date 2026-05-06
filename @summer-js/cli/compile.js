#!/usr/bin/env node

// @ts-check
import fs from 'fs'
import crypto from 'crypto'
import chokidar from 'chokidar'
import path from 'path'
import { Project, ClassDeclaration, SourceFile } from 'ts-morph'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const summerPackage = JSON.parse(fs.readFileSync(__dirname + '/../summer/package.json', { encoding: 'utf-8' }))
const servicePackage = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }))

const watch = process.argv[2] === 'watch'

let PLUGINS = []

fs.rmSync('./compile', { recursive: true, force: true })
fs.mkdirSync('./compile')

console.log('COMPILE_INIT')
const project = new Project({
  tsConfigFilePath: './tsconfig.json'
})

const slash = (/** @type {string} */ path) => {
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

const getAllReferencingSourceFiles = (
  /** @type {SourceFile} */ sf,
  /** @type {SourceFile[]} */ allRefFiles,
  /** @type {SourceFile[]} */ refreshFiles,
  deep = 0
) => {
  if (!sf) {
    return
  }

  if (!refreshFiles.includes(sf) && deep == 0) {
    refreshFiles.push(sf)
  }

  if (!allRefFiles.includes(sf)) {
    allRefFiles.push(sf)
    sf.getReferencingSourceFiles().forEach((refSourceFile) => {
      if (allRefFiles.includes(refSourceFile)) {
        return
      }
      getAllReferencingSourceFiles(refSourceFile, allRefFiles, refreshFiles, deep + 1)
    })
  }
}

const addFileImport = (/** @type {string} */ typeString, /** @type {ClassDeclaration} */ clazz) => {
  if (typeString && typeString.indexOf('import("') >= 0 && typeString.indexOf('node_modules/') < 0) {
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
        statement += `import { ${importName} } from '${result[1]}';`
      }
    }

    if (statement) {
      const sf = clazz.getSourceFile()
      if (!sf.getText().includes(statement)) {
        sf.addStatements(statement)
      }
    }
  }
}

let ALLTypeMapping = {}
const addPropDecorator = (/** type @type {ClassDeclaration} */ cls) => {
  if (!cls) {
    return
  }
  ALLTypeMapping = { ...TypeMapping }
  let statements = ''
  const typeParameters = cls.getTypeParameters().map((tp) => tp.getText())
  cls.getProperties().forEach((p) => {
    let type = getDeclareType(p.getText(), p, undefined, typeParameters)
    const pendingDecorators = []

    const match = p.getText().match(/EnvConfig *< *['"]([^'^"]+)['"]/)
    if (match) {
      pendingDecorators.push({ name: '_EnvConfig', arguments: ["'" + match[1] + "'"] })
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
        if (type.includes('import(')) {
          type = '[]'
        }
        pendingDecorators.push({ name: '_PropDeclareType', arguments: [type] })
      }

      if (p.getDecorators().find((d) => d.getName() === 'Serialize')) {
        if (p.getInitializer() === undefined) {
          modifyActions.push(() => {
            p.setInitializer('undefined as any')
          })
        }
      }
    }

    if (pendingDecorators.length) {
      pendingDecorators.forEach((d) => {
        statements += `\n${d.name}(${d.arguments.join(',')})(${cls.getName()}.prototype,'${p.getName()}');`
      })
    }
  })

  return statements
}

// [0, Array,[]]
// [String, Array,[]]
// [{e1:12,e2:33}, undefined,[]]
// [["val1","val2"], undefined,[]]

const getDeclareType = (/** @type {string} */ declareLine, parameter, paramType, typeParams) => {
  if (
    declareLine.startsWith(':{') ||
    declareLine.startsWith(':import(') ||
    (paramType?.isInterface() && paramType?.getText() !== 'Date')
  ) {
    return '[]'
  }

  const parts = declareLine.split(/:([^:]*)$/)
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
  } else if (!declareLine.includes('=')) {
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

  let isPartial = false
  if (!paramType) {
    paramType = parameter.getType()

    if (paramType.isUnion()) {
      const unionTypes = paramType.getUnionTypes()
      let hasUndefined = unionTypes.find((ut) => ut.isUndefined())
      if (hasUndefined) {
        paramType = paramType.getNonNullableType()
      }
    }

    if (paramType.getText(parameter).startsWith('Partial<')) {
      paramType = paramType.getAliasTypeArguments()[0]
      isPartial = true
    }

    if (paramType.isInterface()) {
      return '[]'
    }
    if (!paramType.isStringLiteral()) {
      paramType = paramType.getApparentType()
    }
  } else if (paramType.getText(parameter).startsWith('Partial<')) {
    isPartial = true
    paramType = paramType.getAliasTypeArguments()[0]
  }

  if (!paramType || paramType.isAnonymous()) {
    return '[]'
  }

  if (ALLTypeMapping[type]) {
    return ALLTypeMapping[type]
  }

  const lowerCaseType = paramType.getText(parameter).toLowerCase()
  if (ALLTypeMapping[lowerCaseType]) {
    return ALLTypeMapping[lowerCaseType]
  }

  if (paramType.getText(parameter).indexOf('<') > 0) {
    const baseType = paramType.getText(parameter).replace(/<.+>/, '').replace('[]', '')
    const typeArgs = paramType
      .getTypeArguments()
      .map((tArg, inx) => {
        if (
          tArg.getText(parameter).indexOf('<') > 0 ||
          (tArg?.getTargetType && tArg?.getTargetType()?.isInterface()) ||
          (tArg?.isInterface && tArg?.isInterface())
        ) {
        } else {
          addFileImport(tArg.getText(parameter), parameter)
        }
        return getDeclareType(':' + tArg.getText(parameter), parameter, tArg, typeParams)
      })
      .join(',')

    try {
      const targetTarget = paramType.getTargetType()
      if (targetTarget.isClass()) {
        return `[${baseType},undefined,[${typeArgs}],${isPartial}]`
      } else if (paramType.isArray()) {
        const pType = paramType.getArrayElementTypeOrThrow()
        if (pType.isClass()) {
          return `[${baseType},Array,[${typeArgs}],${isPartial}]`
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
      return `[()=>${type},Array,undefined,${isPartial}]`
    } else {
      type = TypeMapping[type]
    }
  } else if (paramType.isUnion() && !paramType.isEnum() && !paramType.isEnumLiteral() && !paramType.isBoolean()) {
    const unionTypes = paramType.getUnionTypes()
    const unionArr = []
    for (const ut of unionTypes) {
      if (ut.isStringLiteral()) {
        const suv = ut.getText()
        unionArr.push(suv)
      } else if (ut.isNumberLiteral()) {
        const suv = ut.getText()
        unionArr.push(suv)
      } else if (ut.isBoolean()) {
        const suv = ut.getText()
        unionArr.push(suv)
      } else if (ut.isString()) {
        unionArr.push('String.prototype')
      } else if (ut.isBoolean()) {
        unionArr.push('Boolean.prototype')
      } else if (ut.isNumber()) {
        unionArr.push('Number.prototype')
      } else if (ut.isNull()) {
        unionArr.push('null')
      }
    }
    if (unionArr.length === 0) {
      return '[]'
    }

    if (unionArr.length === 1 && unionArr[0] === 'null') {
      return `[]`
    }
    return `[[${unionArr.join(',')}],undefined,undefined,${isPartial}]`
  } else if (paramType.isClass() || paramType.isEnum() || paramType.isEnumLiteral()) {
    return `[()=>${paramType.getText(parameter)},undefined,undefined,${isPartial}]`
  } else if (paramType.isStringLiteral() || paramType.isNumberLiteral()) {
    return `[${paramType.getText(parameter)},undefined,undefined,${isPartial}]`
  } else {
    type = ALLTypeMapping[type]
  }
  return type
}

const stripColor = (/** @type {string} */ str) => {
  const isTerminal = process.env.TERM !== undefined
  if (isTerminal) {
    return str
  }
  return str.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')
}

const checkError = (/** @type {SourceFile[]} */ checkFileList) => {
  let diagnostics = []
  let counter = 0
  let hasError = false
  let returnErrorCount = 0
  for (const sf of checkFileList) {
    if (process.env.SUMMER_ENV !== 'test' && sf.getFilePath().endsWith('.test.ts')) {
      continue
    }
    const fileDiagnostics = sf.getPreEmitDiagnostics()
    if (fileDiagnostics.length > 0) {
      if (!hasError) {
        hasError = true
        console.error(stripColor('\x1b[31mError compiling source code:\n\x1b[0m'))
      }
      console.log(stripColor(project.formatDiagnosticsWithColorAndContext(fileDiagnostics)))
    }
    diagnostics.push(...fileDiagnostics)

    // check multi return type
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
              if (!hasError) {
                hasError = true
                console.error('\x1b[31m%s\x1b[0m', 'Error compiling source code:\n')
              }
              returnErrorCount++
              console.error(
                `\n\x1b[36m${path.relative(process.cwd(), cls.getSourceFile().getFilePath())}\x1b[0m:\x1b[33m${
                  cMethod.getStartLineNumber() + 1
                }\x1b[0m:\x1b[33m1\x1b[0m`
              )
              console.error(
                cls.getName() + '.' + cMethod.getName() + '()' + ' should return consistent type for api response'
              )
              console.error(
                '\nReturn types: \x1b[33m%s\x1b[0m',
                returnTypeStr.replace(/import\("[^"]+"\)\./g, '') + '\n'
              )
              console.error('Or add "as any" to return type to ignore this error')
              hasError = true
            }

            if (!returnTypeStr.startsWith('{') && !returnType.isInterface()) {
              if (!(returnTypeStr.indexOf('<') > 0 && returnType.getTargetType()?.isInterface())) {
                if (returnType.getSymbol()) {
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

    counter++
    console.log('COMPILE_PROGRESS [ ' + (((counter * 450) / checkFileList.length + 0) / 10).toFixed(0) + '% ]')
  }

  if (diagnostics.length > 0) {
    console.log(
      stripColor(
        `\x1b[33m\nFound ${diagnostics.length + returnErrorCount} Error${diagnostics.length > 1 ? 's' : ''}\x1b[0m`
      )
    )
    compiling = false
    return true
  }

  if (hasError) {
    compiling = false
  }

  return hasError
}

const resolvePath = (dirtyFiles) => {
  if (Object.keys(project.getCompilerOptions().paths || {}).length === 0) {
    return []
  }
  const pathResolveActions = []
  for (const sf of dirtyFiles) {
    if (sf.getFilePath().endsWith('.d.ts')) {
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

/** @type {(()=>void)[]} */
let modifyActions = []

const compile = async () => {
  compiling = true
  const pluginIncs = []

  // refresh from file system
  /** @type {SourceFile[]} */
  const refreshFiles = []

  // refresh an recompile js
  /** @type {SourceFile[]} */
  const dirtyFiles = []

  // type check files
  /** @type {SourceFile[]} */
  let checkFiles = []

  modifyActions = []

  const preUpdateFilesCount = updateFileList.length

  console.log('COMPILE_START')
  for (const { event, updatePath } of updateFileList) {
    if (['change'].includes(event)) {
      if (
        updatePath.endsWith('.ts') ||
        updatePath.endsWith('.js') ||
        updatePath.endsWith('.cjs') ||
        updatePath.endsWith('.mjs')
      ) {
        const sf = project.getSourceFile(path.resolve(updatePath))
        if (sf) {
          sf.refreshFromFileSystemSync()
          refreshFiles.push(sf)
        }
      }
    }

    if (['add'].includes(event)) {
      if (
        updatePath.endsWith('.ts') ||
        updatePath.endsWith('.js') ||
        updatePath.endsWith('.cjs') ||
        updatePath.endsWith('.mjs')
      ) {
        const sf = project.addSourceFilesAtPaths(updatePath)[0]
        if (sf) {
          refreshFiles.push(sf)
        }
      }
    }

    if (['unlink'].includes(event)) {
      try {
        const unlinkSourceFile = project.getSourceFileOrThrow(updatePath)
        project.removeSourceFile(unlinkSourceFile)
        const ext = path.extname(updatePath)
        fs.rmSync(updatePath.replace(/^src/, 'compile').replace(new RegExp(`${ext}$`), '.js'))
        fs.rmSync(updatePath.replace(/^src/, 'compile').replace(new RegExp(`${ext}$`), '.js.map'))
      } catch (e) {}
    }
  }

  if (!isFirstCompile) {
    refreshFiles.forEach((rf) => {
      if (!dirtyFiles.includes(rf)) {
        dirtyFiles.push(rf)
      }
    })
  }

  project.getSourceFiles().forEach((sf) => {
    sf.getFilePath()
    if (process.env.SUMMER_ENV !== 'test' && sf.getFilePath().endsWith('.test.ts')) {
      return
    }
    checkFiles.push(sf)
    if (isFirstCompile) {
      dirtyFiles.push(sf)
    } else {
      sf.getClasses().forEach((cls) => {
        for (const classDecorator of cls.getDecorators()) {
          if (['Controller', 'SocketIOController', 'RpcClient'].includes(classDecorator.getName())) {
            if (!dirtyFiles.includes(sf)) {
              dirtyFiles.push(sf)
            }
            break
          }
        }
      })
    }
  })

  if (isFirstCompile) {
    checkFiles = checkFiles.sort(
      (a, b) => fs.statSync(b.getFilePath()).mtime.getTime() - fs.statSync(a.getFilePath()).mtime.getTime()
    )
  } else {
    checkFiles = checkFiles.sort((a, b) => (refreshFiles.includes(a) ? 0 : 1) - (refreshFiles.includes(b) ? 0 : 1))
  }

  if (checkError(checkFiles)) {
    return
  }

  const indexSourceFile = project.getSourceFileOrThrow('src/index.ts')

  for (const action of modifyActions) {
    await action()
  }

  const sourceFiles = project.getSourceFiles()

  const getImportSourceFiles = (sf) => {
    const imports = sf.getImportDeclarations()
    return imports.map((impt) => impt.getModuleSpecifierSourceFile()).filter((sf) => sf)
  }

  let importFilesList = []
  const autoImportDecorators = [
    'Service',
    'SocketIOController',
    'Injectable',
    'RpcProvider',
    'RpcClient',
    'Middleware',
    'Controller',
    'ErrorHandler'
  ]
  for (const sf of sourceFiles) {
    ;['default.config.ts', process.env.SUMMER_ENV + '.config.ts'].forEach((configFileName) => {
      if (sf.getFilePath().indexOf(configFileName) > 0) {
        const refSourceFiles = getImportSourceFiles(sf)
        refSourceFiles.forEach((refSourceFile) => {
          const found = slash(refSourceFile.getFilePath()).match(/@summer-js\/[^/]+/)
          if (found) {
            if (found[0] !== '@summer-js/summer') {
              PLUGINS.push(found[0])
            }
          } else {
            getImportSourceFiles(refSourceFile).forEach((refSf) => {
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

    // add import file list
    for (const cls of sf.getClasses()) {
      for (const classDecorator of cls.getDecorators()) {
        if (autoImportDecorators.includes(classDecorator.getName())) {
          importFilesList.push('./' + slash(path.relative(path.resolve() + '/src', cls.getSourceFile().getFilePath())))
        }
      }
    }
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

  let compileCounter = 0
  for (const sf of dirtyFiles) {
    compileCounter++
    if (sf.getFilePath().endsWith('.d.ts') || (watch && sf.getFilePath().endsWith('.test.ts'))) {
      continue
    }

    let fileDataTypeStatement = ''
    let isController = false
    for (const cls of sf.getClasses()) {
      fileDataTypeStatement += addPropDecorator(cls)
      for (const classDecorator of cls.getDecorators()) {
        if (classDecorator.getName() === 'Controller') {
          isController = true
          let returnTypeStatements = ''
          cls.getMethods().forEach((cMethod) => {
            if (cMethod.getDecorators().length > 0) {
              cMethod.getParameters().forEach((param, inx) => {
                if (param.getDecorators().length > 0) {
                  fileDataTypeStatement += `\n_ParamDeclareType(${getDeclareType(
                    param.getText(),
                    param,
                    undefined,
                    undefined
                  )},'${param.getName()}')(${cls.getName()}.prototype,'${cMethod.getName()}',${inx});`
                  if (param.hasQuestionToken() || param.hasInitializer()) {
                    fileDataTypeStatement += `\n_Optional()(${cls.getName()}.prototype,'${cMethod.getName()}',${inx});`
                  }
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
              const declareType = getDeclareType(':' + returnTypeStr, cls, returnType, undefined)
              returnTypeStatements += `\n_ReturnDeclareType(${declareType})(${cls.getName()}.prototype,'${cMethod.getName()}');`
            }
          })
          fileDataTypeStatement += returnTypeStatements
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
                        returnPromiseType,
                        undefined
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
          isController = true
          cls.getMethods().forEach((cMethod) => {
            if (cMethod.getDecorators().find((d) => d.getName() === 'On')) {
              cMethod.getParameters().forEach((param, inx) => {
                if (inx >= 1) {
                  fileDataTypeStatement += `\n_ParamDeclareType(${getDeclareType(
                    param.getText(),
                    param,
                    undefined,
                    undefined
                  )},'${param.getName()}')(${cls.getName()}.prototype,'${cMethod.getName()}',${inx});`
                  if (param.hasQuestionToken() || param.hasInitializer()) {
                    fileDataTypeStatement += `\n_Optional()(${cls.getName()}.prototype,'${cMethod.getName()}',${inx});`
                  }
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

    modifyActions.push(() => {
      if (!sf.getText().includes(fileDataTypeStatement) && fileDataTypeStatement) {
        sf.addStatements(fileDataTypeStatement)
      } else if (isController) {
        if (!isFirstCompile) {
          sf['_ignore_emit'] = true
        }
      }
    })

    console.log('COMPILE_PROGRESS [ ' + (((compileCounter * 100) / dirtyFiles.length + 450) / 10).toFixed(0) + '% ]')
  }

  const pathResolveActions = resolvePath(isFirstCompile ? dirtyFiles : refreshFiles)
  pathResolveActions.forEach((action, inx) => {
    action()
    console.log('COMPILE_PROGRESS [ ' + (((inx * 200) / pathResolveActions.length + 550) / 10).toFixed(0) + '% ]')
  })

  modifyActions.forEach((action, inx) => {
    action()
    console.log('COMPILE_PROGRESS [ ' + (((inx * 150) / modifyActions.length + 750) / 10).toFixed(0) + '% ]')
  })

  console.log('COMPILE_PROGRESS [ 100% ]')

  const statements = []
  statements.push(`(global).SUMMER_VERSION = "${summerPackage.version}";`)
  statements.push(`(global).SUMMER_ENV = "${process.env.SUMMER_ENV || ''}";`)
  statements.push(`(global).SUMMER_BUILD_TIMESTAMP = ${Date.now()};`)
  statements.push(`(global).SERVICE_NAME = "${servicePackage.name}";`)
  statements.push(`(global).SERVICE_VERSION = "${servicePackage.version || ''}";`)

  Array.from(new Set(importFilesList)).forEach((path) => {
    statements.push('require("' + path.replace(/\.ts$/, '') + '");')
  })

  // project.resolveSourceFileDependencies()

  if (updateFileList.length > preUpdateFilesCount) {
    if (isFirstCompile) {
      dirtyFiles.forEach((df) => {
        df.refreshFromFileSystemSync()
      })
    }
    compile()
    return
  }

  const emissions = []
  dirtyFiles.forEach((df) => {
    if (process.env.SUMMER_ENV !== 'test' && df.getFilePath().endsWith('.test.ts')) {
      return
    }
    if (df['_ignore_emit']) {
      return
    }
    emissions.push(project.emit({ targetSourceFile: df }))
  })

  await Promise.all(emissions)

  const defaultConfigPath = './compile/config/default.config.js'
  if (fs.existsSync(defaultConfigPath)) {
    const content = fs.readFileSync(defaultConfigPath, { encoding: 'utf-8' }).trim()
    if (content.indexOf('exports.') > 0) {
      if (content.indexOf('$$_DEFAULT_CONFIG') < 0) {
        fs.appendFileSync(defaultConfigPath, '\nglobal["$$_DEFAULT_CONFIG"] = exports;')
      }
      statements.push('require("./config/default.config");')
    }
  }

  const envConfigPath = `./compile/config/${process.env.SUMMER_ENV}.config.js`
  if (fs.existsSync(envConfigPath)) {
    const content = fs.readFileSync(envConfigPath, { encoding: 'utf-8' }).trim()
    if (content.indexOf('exports.') > 0) {
      if (content.indexOf('$$_ENV_CONFIG') < 0) {
        fs.appendFileSync(envConfigPath, '\nglobal["$$_ENV_CONFIG"] = exports;')
      }
      statements.push(`require("./config/${process.env.SUMMER_ENV}.config");`)
    }
  }

  project.emitSync({ targetSourceFile: indexSourceFile })
  const compileIndexPath = indexSourceFile.getFilePath().replace('/src/', '/compile/').replace(/.ts$/, '.js')
  const indexFileContent = fs.readFileSync(compileIndexPath, { encoding: 'utf-8' })
  fs.writeFileSync(compileIndexPath, statements.join('') + indexFileContent)
  dirtyFiles.splice(0, dirtyFiles.length)

  for (const p of pluginIncs) {
    p.postCompile && (await p.postCompile(isFirstCompile))
  }

  isFirstCompile = false
  updateFileList.splice(0, updateFileList.length)

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
        if (!compiling) {
          await compile()
        }
      }, 100)
    })
} else {
  compile()
}

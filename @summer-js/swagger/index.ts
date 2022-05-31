import { SummerPlugin, getConfig, Controller, Get, Query, ServerConfig, addPlugin } from '@summer-js/summer'
import { pathToRegexp } from 'path-to-regexp'
import path from 'path'
import {
  _queryConvertFunc,
  _pathParamConvertFunc,
  _bodyConvertFunc,
  _headerConvertFunc,
  _fileConvertFunc
} from '@summer-js/summer'
import { requestMapping } from '@summer-js/summer/lib/request-mapping'
import { getAbsoluteFSPath } from 'swagger-ui-dist'
import { ClassDeclaration } from 'ts-morph'
import fs from 'fs'
;(global as any)._ApiReturnType =
  (returnType: string, rootType: string) => (target: Object, propertyKey: string, descriptor: any) => {
    Reflect.defineMetadata('Api:ReturnType', returnType, target, propertyKey)
    Reflect.defineMetadata('Api:RootType', rootType, target, propertyKey)
  }

declare const _ParamDeclareType: any
declare global {
  const _ApiReturnType: any
}

interface Schema {
  type: string
  example?: any
  required?: string[]
  properties?: Record<string, { type: string; description?: string }>
  items?: Schema
}

export interface SwaggerConfig {
  docPath: string
  info: {
    title: string
    description?: string
    version: string
    termsOfService?: string
    contact?: { email: string }
    license?: { name: string; url: string }
  }
  host?: string
  schemes?: ('https' | 'http' | 'ws' | 'wss')[]
}

interface SwaggerDoc {
  swagger: string
  docPath: string
  basePath?: string
  info: {
    title: string
    description?: string
    version: string
    termsOfService?: string
    contact?: { email: string }
    license?: { name: string; url: string }
  }
  host?: string
  tags: {
    name: string
    description: string
    externalDocs?: { description: string; url: string }
  }[]
  schemes?: ('https' | 'http' | 'ws' | 'wss')[]
  paths: Record<
    string,
    Record<
      string,
      {
        tags: string[]
        summary: string
        description?: string
        operationId?: string
        consumes?: string[]
        produces?: string[]
        parameters?: {
          name: string
          in: string
          description: string
          required: boolean
          schema?: Schema
        }[]
        responses?: Record<string, { description?: string; schema?: Schema }>
        security?: [Record<string, string[]>]
        deprecated?: boolean
      }
    >
  >
  securityDefinitions?: {}
  definitions?: {}
  externalDocs?: { description: string; url: string }
}

const swaggerJson: SwaggerDoc = {
  swagger: '2.0',
  docPath: '',
  info: { title: '', version: '' },
  tags: [],
  paths: {}
}

class SwaggerPlugin implements SummerPlugin {
  configKey = 'SWAGGER_CONFIG'
  async init(config: SwaggerConfig) {
    if (!config) {
      return
    }
    Object.assign(swaggerJson, config)
    const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']
    if (serverConfig) {
      if (!serverConfig.static) {
        serverConfig.static = []
      }
      serverConfig.static.push({ requestPathRoot: '/swagger-res', destPathRoot: 'resource/swagger-res' })
      if (config.docPath && config.docPath !== '/swagger-ui') {
        // change path
        requestMapping[`${config.docPath}`] = requestMapping['/swagger-ui']
        requestMapping[`${config.docPath}`].pathRegExp = pathToRegexp(`${config.docPath}`)
        delete requestMapping['/swagger-ui']

        requestMapping[`${config.docPath}/swagger-docs.json`] = requestMapping['/swagger-ui/swagger-docs.json']
        requestMapping[`${config.docPath}/swagger-docs.json`].pathRegExp = pathToRegexp(
          `${config.docPath}/swagger-docs.json`
        )
        delete requestMapping['/swagger-ui/swagger-docs.json']
      }
    }
  }

  compile(clazz: ClassDeclaration) {
    for (const classDecorator of clazz.getDecorators()) {
      if (classDecorator.getName() === 'ApiDocGroup') {
        const instanceMethods = clazz.getInstanceMethods()
        instanceMethods.forEach((m) => {
          const apiDoc = m.getDecorator('ApiDoc')
          if (apiDoc) {
            // TypeFormatFlags.NoTruncation = 1
            let retType = m.getReturnType()
            let returnType = retType.getText(clazz, 1)
            let isArray = false

            if (returnType.startsWith('Promise<')) {
              retType = retType.getTypeArguments()[0]
              returnType = retType.getText(clazz, 1)
            }

            if (returnType && returnType.startsWith('import("')) {
              const importParts = returnType.split('.')
              clazz.getSourceFile().addImportDeclaration({
                namedImports: [importParts[importParts.length - 1].replace(/\[\]$/, '')],
                moduleSpecifier:
                  './' +
                  path.relative(
                    path.dirname(clazz.getSourceFile().getFilePath()),
                    JSON.parse('"' + returnType.substring(8).replace(/"\)\..+$/, '') + '"') + '\n'
                  )
              })

              returnType = retType.getText(clazz, 1)
            }

            if (returnType.endsWith('[]')) {
              isArray = true
              returnType = returnType.replace(/\[\]$/, '')
            }

            if (returnType.startsWith('Array<')) {
              isArray = true
              returnType = returnType.replace(/^Array</, '').replace(/>$/, '')
            }

            if (['number', 'string', 'boolean', 'int', 'float'].includes(returnType)) {
              returnType = returnType.replace(/^(.)/, (matched) => matched.toUpperCase())
            }
            if (returnType === 'bigint') {
              returnType = 'BigInt'
            }

            if (
              retType.isInterface() ||
              retType.isTypeParameter() ||
              returnType.indexOf('<') >= 0 ||
              returnType.indexOf('[') >= 0 ||
              returnType.indexOf('{') >= 0 ||
              returnType === 'void'
            ) {
              returnType = undefined
            }

            m.addDecorator({
              name: '_ApiReturnType',
              arguments: [returnType || 'undefined', isArray ? "'array'" : returnType ? "'object'" : "'string'"]
            })
          }
        })
      }
    }
  }

  async postCompile() {
    let swaggerUIPath = getAbsoluteFSPath()
    if (!fs.existsSync(swaggerUIPath)) {
      swaggerUIPath = '../../node_modules/swagger-ui-dist'
    }

    let swaggerPluginPath = './node_modules/@summer-js/swagger'
    if (!fs.existsSync(swaggerPluginPath)) {
      swaggerPluginPath = '../../node_modules/@summer-js/swagger'
    }

    if (!fs.existsSync('./resource')) {
      fs.mkdirSync('./resource')
    }

    if (fs.existsSync('./resource/swagger-res')) {
      fs.rmSync('./resource/swagger-res', { recursive: true, force: true })
    }
    fs.mkdirSync('./resource/swagger-res')

    const files = [
      'swagger-ui.css',
      'swagger-ui-bundle.js',
      'swagger-ui-standalone-preset.js',
      'favicon-16x16.png',
      'favicon-32x32.png'
    ]
    files.forEach((f) => {
      fs.copyFileSync(swaggerUIPath + '/' + f, './resource/swagger-res/' + f)
    })
    fs.copyFileSync(swaggerPluginPath + '/index.html', './resource/swagger-res/index.html')
  }
}

interface ApiDocGroupOption {
  description?: string
  order?: number
  category?: string
}

const allTags = []
export const ApiDocGroup = (name: string, apiDocGroupOptions: ApiDocGroupOption = {}) => {
  const options = { description: '', order: 9999999, category: '' }
  Object.assign(options, apiDocGroupOptions)
  return function (target: any) {
    allTags.push({
      controllerName: target.name,
      name,
      ...options
    })
  }
}

interface ControllerApiDoc {
  description?: string
  example?: {
    request?: any
    response?: any
  }
  errors?: Record<string | number, any>
  order?: number
}

const allApis: (ControllerApiDoc & { summary: string; controller: any; controllerName: string; callMethod: string })[] =
  []
export const ApiDoc = (summary: string, options: ControllerApiDoc = {}) => {
  const opts = { order: 9999999, example: {} }
  Object.assign(opts, options)
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    allApis.push({
      ...opts,
      summary,
      controller: target,
      controllerName: target.constructor.name,
      callMethod: propertyKey
    })
  }
}

const findRoute = (controllerName: string, callMethod: string) => {
  for (const path in requestMapping) {
    for (const requestMethod in requestMapping[path]) {
      const route = requestMapping[path][requestMethod]
      if (route.controllerName === controllerName && route.callMethod === callMethod) {
        return { path, requestMethod, params: route.params }
      }
    }
  }
  return null
}

const findTag = (controllerName: string) => {
  const tag = allTags.find((tag) => tag.controllerName === controllerName)
  if (tag) {
    return tag.name
  }
  return ''
}

const findCategory = (controllerName: string) => {
  const tag = allTags.find((tag) => tag.controllerName === controllerName)
  if (tag) {
    return tag.category
  }
  return ''
}

const parmMatchPattern = {
  query: _queryConvertFunc,
  path: _pathParamConvertFunc,
  header: _headerConvertFunc,
  formData: _fileConvertFunc,
  body: _bodyConvertFunc
}

const getType = (type: any) => {
  if (!type) {
    return ''
  }
  const basicTypes = ['int', 'bigint', 'number', 'string', 'boolean']
  if (basicTypes.includes(type.name.toLowerCase())) {
    return intToInteger(type.name.toLowerCase())
  }
  return 'object'
}

const intToInteger = (type: string) => {
  if (type === 'int' || type === 'bigint') {
    return 'integer'
  }

  return type
}

const getParamType = (func) => {
  for (const p in parmMatchPattern) {
    if (parmMatchPattern[p].toString() === func.toString()) {
      return p
    }
  }
  return null
}

const getRequiredKeys = (t: any, isRequest: boolean) => {
  if (!isRequest) {
    return []
  }
  const requireKeys = []
  const typeInc = new t()
  for (const key of Reflect.getOwnMetadataKeys(t.prototype)) {
    const required = Reflect.getMetadata('required', typeInc, key)
    if (required) {
      requireKeys.push(key)
    }
  }
  return requireKeys
}

const getRequestTypeDesc = (t: any, isRequest: boolean) => {
  if (getType(t) !== 'object') {
    return { type: getType(t), description: '' }
  }

  const typeInc = new t()
  const typeDesc = {}
  for (const key of Reflect.getOwnMetadataKeys(t.prototype)) {
    const declareType = Reflect.getMetadata('DeclareType', typeInc, key)
    const designType = Reflect.getMetadata('design:type', typeInc, key)

    if (designType === Object && declareType !== _DateTime && declareType !== _TimeStamp) {
      typeDesc[key] = {
        type: 'object',
        description: '',
        properties: getRequestTypeDesc(declareType, isRequest)
      }
    } else if (designType === Array) {
      typeDesc[key] = {
        type: 'array',
        description: '',
        items: getRequestTypeDesc(declareType, isRequest)
      }
    } else {
      // string enum
      if (typeof declareType === 'object' && designType.name === 'String') {
        typeDesc[key] = {
          type: 'string',
          enum: Object.keys(declareType),
          description: ''
        }
      }
      // number enum
      else if (typeof declareType === 'object' && designType.name === 'Number') {
        typeDesc[key] = {
          type: 'string',
          enum: Object.keys(declareType).filter((k) => typeof declareType[k] === 'number'),
          description: ''
        }
      } else if (declareType === Date) {
        typeDesc[key] = {
          type: 'string',
          format: 'date',
          example: '2012-12-12',
          description: ''
        }
      } else if (declareType === _DateTime) {
        typeDesc[key] = {
          type: 'string',
          format: 'datetime',
          example: '2012-12-12 12:12:12',
          description: ''
        }
      } else if (declareType === _TimeStamp) {
        typeDesc[key] = {
          type: 'int',
          example: Date.now(),
          description: ''
        }
      } else {
        typeDesc[key] = {
          type: intToInteger(declareType.name.toLowerCase()),
          description: ''
        }
      }
    }
  }

  const desc: any = { type: 'object', properties: typeDesc, description: '' }
  const requireKeys = getRequiredKeys(t, isRequest)
  if (requireKeys.length > 0) {
    desc.required = requireKeys
  }
  return desc
}

@Controller('/swagger-ui')
export class SummerSwaggerUIController {
  @Get
  getSwaggerUIPage(@Query('urls.primaryName') @_ParamDeclareType(String) primaryName: string) {
    let allPages = allTags.map((at) => at.category || '')
    allPages = Array.from(new Set(allPages))
    let indexHTML = fs.readFileSync('./resource/swagger-res/index.html', { encoding: 'utf-8' })
    const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']
    const basePath = serverConfig.basePath || ''
    indexHTML = indexHTML.replace(/\{\{BASE_PATH\}\}/g, basePath).replace('{{TITLE}}', swaggerJson.info.title)
    if (allPages.length === 1) {
      indexHTML = indexHTML.replace(
        '//{{URLS}}',
        `urls:[{url:"${basePath + swaggerJson.docPath}/swagger-docs.json",name:"All"}],`
      )
    } else {
      const urls = allPages.map((ap) => ({
        name: ap,
        url: `${basePath + swaggerJson.docPath}/swagger-docs.json?category=${encodeURIComponent(ap)}`
      }))
      indexHTML = indexHTML.replace('//{{URLS}}', `urls:${JSON.stringify(urls)},\n'urls.primaryName':'${primaryName}',`)
    }

    return indexHTML
  }

  @Get('/swagger-docs.json')
  getSwaggerDocument(@Query @_ParamDeclareType(String) category: string) {
    swaggerJson.tags = []
    swaggerJson.paths = {}
    category = category || ''

    allTags.sort((a, b) => a.order - b.order)
    allTags
      .filter((t) => t.category === category)
      .forEach((tag) => {
        swaggerJson.tags.push({ name: tag.name, description: tag.description })
      })

    allApis.sort((a, b) => a.order - b.order)
    allApis.forEach((api) => {
      const apiCate = findCategory(api.controllerName)
      if (apiCate !== category) {
        return
      }
      const roteInfo = findRoute(api.controllerName, api.callMethod)
      if (roteInfo) {
        const { path, requestMethod, params } = roteInfo
        let docPath = (path || '/').replace(/\/{2,}/g, '/')
        docPath = docPath.replace(/:([^/]+)/g, '{$1}')
        if (!swaggerJson.paths[docPath]) {
          swaggerJson.paths[docPath] = {}
        }
        const parameters = []
        let isFormBody = false
        params.forEach((param) => {
          const paramType = getParamType(param.paramMethod.toString())
          if (paramType === 'formData') {
            isFormBody = true
          }
        })

        params.forEach((param) => {
          let paramType = getParamType(param.paramMethod.toString())
          if (isFormBody && paramType === 'body') {
            const formProps = getRequestTypeDesc(param.declareType, true).properties
            for (const filed in formProps) {
              let isRequired = false
              if (param.declareType && typeof param.declareType === 'function') {
                isRequired = Reflect.getMetadata('required', new param.declareType(), filed)
              }
              parameters.push({
                name: filed,
                in: 'formData',
                description: '',
                required: isRequired,
                type: formProps[filed].type
              })
            }
          } else if (paramType) {
            const ptype = getType(param.declareType)
            const parameter: any = {
              name: param.paramValues[0],
              in: paramType,
              description: '',
              required: ['path', 'body', 'formData'].includes(paramType) ? true : false
            }

            const type = (paramType === 'formData' ? 'file' : ptype) || 'string'
            if (parameter.in !== 'body') {
              parameter.type = type
            }
            const schema =
              ptype === 'object'
                ? {
                    example: api.example?.request,
                    ...getRequestTypeDesc(param.declareType, true)
                  }
                : ptype === 'array'
                ? {
                    example: api.example?.request,
                    type: 'array',
                    items: getRequestTypeDesc(param.declareType, true)
                  }
                : null
            if (schema) {
              parameter.schema = schema
            }
            parameters.push(parameter)
          }
        })

        const errorResponse = {}
        for (const key in api.errors) {
          const resExample = api.errors[key] || ''
          errorResponse[key] = {
            description: '',
            schema: { type: typeof resExample === 'object' ? 'object' : 'string', properties: {}, example: resExample }
          }
        }

        const successResExample = api.example?.response

        const declareReturnType = Reflect.getMetadata('Api:ReturnType', api.controller, api.callMethod)
        const returnRootType = Reflect.getMetadata('Api:RootType', api.controller, api.callMethod)

        const consumes = []
        if (parameters.find((p) => p.type === 'file')) {
          consumes.push('multipart/form-data')
        }

        swaggerJson.paths[docPath][requestMethod.toLowerCase()] = {
          tags: [findTag(api.controllerName)],
          summary: api.summary,
          description: api.description,
          operationId: api.summary || api.callMethod,
          consumes,
          // consumes: ['application/json'],
          // produces: ['application/json'],
          parameters,
          responses: {
            200: {
              description: '',
              schema:
                returnRootType === 'object'
                  ? {
                      example: successResExample,
                      description: '',
                      ...getRequestTypeDesc(declareReturnType, false)
                    }
                  : returnRootType === 'array'
                  ? {
                      example: successResExample,
                      type: 'array',
                      items: getRequestTypeDesc(declareReturnType, false)
                    }
                  : {
                      example: successResExample,
                      type: 'string'
                    }
            },
            ...errorResponse
          }
        }
      }
    })

    const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']
    const basePath = serverConfig.basePath || ''
    swaggerJson.basePath = basePath
    const outPutJSON = { ...swaggerJson }
    delete outPutJSON.docPath
    return outPutJSON
  }
}

addPlugin(SwaggerPlugin)
export default SwaggerPlugin

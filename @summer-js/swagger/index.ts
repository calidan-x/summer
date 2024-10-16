import {
  SummerPlugin,
  getEnvConfig,
  Controller,
  Get,
  Query,
  ServerConfig,
  addPlugin,
  Logger,
  Context,
  ResponseError,
  Cookie,
  StreamingData
} from '@summer-js/summer'
import crypto from 'crypto'
import { pathToRegexp } from 'path-to-regexp'

import {
  _queryConvertFunc,
  _queriesConvertFunc,
  _pathParamConvertFunc,
  _bodyConvertFunc,
  _headerConvertFunc,
  File
} from '@summer-js/summer'
import { requestMapping } from '@summer-js/summer/lib/request-mapping'
import { getAbsoluteFSPath } from 'swagger-ui-dist'
import { ClassDeclaration } from 'ts-morph'
import fs from 'fs'
import { matchPathMethod } from '@summer-js/summer/lib/request-handler'

interface Schema {
  type: string
  example?: any
  required?: string[]
  properties?: Record<string, { type: string; description?: string }>
  items?: Schema
}

interface SecurityDefinitionBasic {
  type: 'basic'
}

interface SecurityDefinitionApiKey {
  type: 'apiKey'
  name: string
  in: 'header' | 'query'
}

interface SecurityDefinitionOAuth2 {
  type: 'oauth2'
  authorizationUrl: string
  flow: string
  scopes: Record<string, string>[]
}

export interface SwaggerConfig {
  docPath: string
  readTypeORMComment?: boolean
  password?: string
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
  securitySchemes?: Record<string, SecurityDefinitionBasic | SecurityDefinitionApiKey | SecurityDefinitionOAuth2>
}

interface SwaggerDoc {
  openapi: string
  docPath: string
  readTypeORMComment?: boolean
  password?: string
  servers?: { url?: string; description?: string }[]
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
    // path
    string,
    Record<
      // method
      string,
      {
        tags: string[]
        summary: string
        description?: string
        operationId?: string
        produces?: string[]
        requestBody?: { required: boolean; content: Record<string, { schema: Schema }> }
        parameters?: {
          name: string
          in: 'path' | 'query' | 'header' | 'cookie'
          description: string
          required: boolean
          schema?: Schema
        }[]
        responses?: Record<string, { description?: string; content: Record<string, { schema?: Schema }> }>
        security?: Record<string, string[]>[]
        deprecated?: boolean
      }
    >
  >
  components?: {
    securitySchemes?: Record<string, SecurityDefinitionBasic | SecurityDefinitionApiKey | SecurityDefinitionOAuth2>
  }
  definitions?: {}
  externalDocs?: { description: string; url: string }
}

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex')
}

const swaggerJson: SwaggerDoc = {
  openapi: '3.1.0',
  docPath: '',
  info: { title: '', version: '' },
  tags: [],
  paths: {}
}

class SwaggerPlugin extends SummerPlugin {
  configKey = 'SWAGGER_CONFIG'
  async init(config: SwaggerConfig) {
    if (!config) {
      return
    }
    if (!config.docPath.endsWith('/')) {
      config.docPath = config.docPath + '/'
    }
    if (config.securitySchemes) {
      swaggerJson.components = { securitySchemes: config.securitySchemes }
    }
    Object.assign(swaggerJson, config)
    delete swaggerJson['securitySchemes']
    const serverConfig: ServerConfig = getEnvConfig('SERVER_CONFIG')
    if (serverConfig) {
      if (!serverConfig.static) {
        serverConfig.static = []
      }
      serverConfig.static.push({
        requestPath: config.docPath + 'swagger-res',
        destPath: 'resource/swagger-res'
      })
      if (config.docPath) {
        // change path
        requestMapping[config.docPath.replace(/\/$/, '')] = requestMapping['/-summer-swagger-ui']
        requestMapping[config.docPath.replace(/\/$/, '')].pathRegExp = pathToRegexp(config.docPath).regexp
        delete requestMapping['/-summer-swagger-ui']

        requestMapping[config.docPath] = requestMapping['/-summer-swagger-ui/index']
        requestMapping[config.docPath].pathRegExp = pathToRegexp(config.docPath).regexp
        delete requestMapping['/-summer-swagger-ui/index']

        requestMapping[`${config.docPath}swagger-docs.json`] = requestMapping['/-summer-swagger-ui/swagger-docs.json']
        requestMapping[`${config.docPath}swagger-docs.json`].pathRegExp = pathToRegexp(
          `${config.docPath}swagger-docs.json`
        ).regexp
        delete requestMapping['/-summer-swagger-ui/swagger-docs.json']

        requestMapping[`${config.docPath}check-password`] = requestMapping['/-summer-swagger-ui/check-password']
        requestMapping[`${config.docPath}check-password`].pathRegExp = pathToRegexp(
          `${config.docPath}check-password`
        ).regexp
        delete requestMapping['/-summer-swagger-ui/check-password']
      }
    }

    const isSummerTesting = process.env.SUMMER_TESTING !== undefined
    if (!isSummerTesting) {
      Logger.info(
        'Swagger url: http://127.0.0.1:' +
          serverConfig.port +
          (serverConfig.basePath ? serverConfig.basePath : '') +
          config.docPath
      )
    }
  }

  compile(clazz: ClassDeclaration, modifyActions: (() => void)[]) {
    let hasImport = false
    for (const classDecorator of clazz.getDecorators()) {
      // remember return type and add api doc
      if (classDecorator.getName() === 'ApiDocGroup') {
        const instanceMethods = clazz.getInstanceMethods()
        instanceMethods.forEach((m) => {
          let apiDoc = m.getDecorator('ApiDoc') !== undefined
          if (!apiDoc) {
            if (
              m
                .getDecorators()
                .find((d) => ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Head', 'Options'].includes(d.getName()))
            ) {
              if (!m.getDecorator('ApiDoc')) {
                m.getSourceFile()
                  .getImportDeclarations()
                  .forEach((d) => {
                    d.getNamedImports().forEach((n) => {
                      if (n.getName() === 'ApiDoc') {
                        hasImport = true
                      }
                    })
                  })
                if (!hasImport) {
                  modifyActions.push(() => {
                    m.getSourceFile()
                      .getImportDeclarations()[0]
                      .replaceWithText(
                        "import {ApiDoc} from '@summer-js/swagger';" +
                          m.getSourceFile().getImportDeclarations()[0].getText()
                      )
                  })
                  hasImport = true
                }
              }
              modifyActions.push(() => {
                m.addDecorator({ name: 'ApiDoc', arguments: ["''"] })
                m.getChildren()[0].replaceWithText(
                  m
                    .getChildren()[0]
                    .getText()
                    .replace(/\n[^\n]*@ApiDoc/g, ' @ApiDoc')
                )
              })
              apiDoc = true
            }
          }
        })
      }
    }
  }

  async postCompile(isFirstCompile: boolean) {
    let swaggerUIPath = getAbsoluteFSPath()
    if (!fs.existsSync(swaggerUIPath)) {
      swaggerUIPath = '../../node_modules/swagger-ui-dist'
    }

    let swaggerPluginPath = swaggerUIPath + '/../@summer-js/swagger'
    if (!fs.existsSync(swaggerPluginPath)) {
      swaggerPluginPath = '../../node_modules/@summer-js/swagger'
    }

    if (!fs.existsSync('./resource')) {
      fs.mkdirSync('./resource')
    }

    if (!fs.existsSync('./resource/swagger-res')) {
      fs.mkdirSync('./resource/swagger-res')
    }

    const files = [
      'swagger-ui.css',
      'swagger-ui-bundle.js',
      'swagger-ui-standalone-preset.js',
      'favicon-16x16.png',
      'favicon-32x32.png'
    ]
    files.forEach((f) => {
      if (!fs.existsSync('./resource/swagger-res/' + f) || isFirstCompile) {
        fs.copyFileSync(swaggerUIPath + '/' + f, './resource/swagger-res/' + f)
      }
    })
    if (!fs.existsSync('./resource/swagger-res/index.html') || isFirstCompile) {
      fs.copyFileSync(swaggerPluginPath + '/index.html', './resource/swagger-res/index.html')
    }
  }
}

interface ApiDocGroupOption {
  description?: string
  order?: number
  category?: string
  security?: Record<string, string[]>[]
}

const allTags: ({
  controllerClass: any
  controllerName: string
  name: string
  description: string
  order: number
  category: string
} & ApiDocGroupOption)[] = []

export const ApiDocGroup = (name: string, apiDocGroupOptions: ApiDocGroupOption = {}) => {
  const options = { description: '', order: 9999999, category: '' }
  Object.assign(options, apiDocGroupOptions)
  return function (target: any) {
    allTags.push({
      controllerName: target.name,
      controllerClass: target,
      name,
      ...options
    })
  }
}

const convertType = (d0) => {
  if (typeof d0 === 'function' && d0.name === '') {
    return d0()
  }
  return d0
}

const getAllProps = (clazz) => {
  const allProperties: any[] = []
  while (clazz.name) {
    allProperties.splice(0, 0, ...Reflect.getOwnMetadataKeys(clazz.prototype))
    clazz = clazz.__proto__
  }
  return allProperties
}

export const PropDoc = (description: string, example?: any) => {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('Api:PropDescription', description, target, propertyKey)
    if (example) {
      Reflect.defineMetadata('Api:PropExample', example, target, propertyKey)
    }
  }
}

interface ControllerApiDoc {
  description?: string
  deprecated?: boolean
  security?: Record<string, string[]>[]
  example?: {
    request?: any
    response?: any
  }
  errors?: ({ statusCode: number | string; description?: string; example: any } | ResponseError)[]
  order?: number
}

const allApis: (ControllerApiDoc & {
  summary: string
  controller: any
  controllerClass: any
  controllerName: string
  callMethod: string
})[] = []

export const ApiDoc = (summary: string, options: ControllerApiDoc = {}) => {
  const opts = { order: 9999999, example: {} }
  Object.assign(opts, options)
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    allApis.push({
      ...opts,
      summary,
      controller: target,
      controllerClass: target.constructor,
      controllerName: target.constructor.name,
      callMethod: propertyKey
    })
  }
}

const findRoute = (controllerClass: any, callMethod: string) => {
  const routes: {
    path: string
    requestMethod: string
    params: any
  }[] = []
  for (const path in requestMapping) {
    for (const requestMethod in requestMapping[path]) {
      const route = requestMapping[path][requestMethod]
      if (route.controllerClass === controllerClass && route.callMethod === callMethod) {
        routes.push({ path, requestMethod, params: route.params })
      }
    }
  }
  return routes
}

const findTag = (controllerClass: string) => {
  const tag = allTags.find((tag) => tag.controllerClass === controllerClass)
  if (tag) {
    return tag.name
  }
  return ''
}

const findSecurity = (controllerClass: string) => {
  const tag = allTags.find((tag) => tag.controllerClass === controllerClass)
  if (tag) {
    return tag.security || []
  }
  return []
}

const findCategory = (controllerClass: string) => {
  const tag = allTags.find((tag) => tag.controllerClass === controllerClass)
  if (tag) {
    return tag.category
  }
  return ''
}

const parmMatchPattern = {
  queries: _queriesConvertFunc,
  query: _queryConvertFunc,
  path: _pathParamConvertFunc,
  header: _headerConvertFunc,
  body: _bodyConvertFunc
}

const getType = (type: any) => {
  if (!type) {
    return ''
  }
  if (!type.name) {
    return ''
  }
  const basicTypes = ['int', 'bigint', 'number', 'string', 'boolean']
  if (basicTypes.includes(type.name.toLowerCase())) {
    return intToInteger(type.name.toLowerCase())
  }

  if (type === Date) {
    return 'string'
  }

  if (type === _Int) {
    return 'integer'
  }

  if (type === File) {
    return 'file'
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
  const requireKeys: any[] = []
  for (const key of getAllProps(t)) {
    const required = !Reflect.getMetadata('optional', t.prototype, key)
    if (required) {
      requireKeys.push(key)
    }
  }
  return requireKeys
}

const getTypeDesc = (dType: any, typeParams: any[], isRequest: boolean, deep = 0) => {
  if (getType(dType) !== 'object') {
    return { type: getType(dType) }
  }

  if (deep == 20) {
    return { type: 'object' }
  }

  const typeDesc = {}

  for (const key of getAllProps(dType)) {
    let [d0, d1, d2] = Reflect.getMetadata('DeclareType', dType.prototype, key) || []
    d0 = convertType(d0)

    if (typeof d0 === 'number') {
      const gDeclareType = typeParams[d0]
      if (gDeclareType === undefined) {
        typeDesc[key] = { example: '<UNKNOWN>' }
        continue
      }
      d0 = gDeclareType[0]
      d0 = convertType(d0)
      d1 = d1 || gDeclareType[1]
      d2 = gDeclareType[2]
    }

    const isArray = d1 === Array

    if (d2) {
      d2.forEach((d, inx) => {
        if (typeof d[0] === 'number') {
          d2[inx] = typeParams[d[0]]
        }
      })
    }

    if (getType(d0) === 'object') {
      let propDescription = Reflect.getMetadata('Api:PropDescription', dType.prototype, key)
      let propExample = Reflect.getMetadata('Api:PropExample', dType.prototype, key)
      if (isArray) {
        typeDesc[key] = { type: 'array', items: getTypeDesc(d0, typeParams, isRequest, deep + 1) }
      } else {
        const typeParams = d2
        typeDesc[key] = getTypeDesc(d0, typeParams, isRequest, deep + 1)
      }
      if (propDescription) {
        typeDesc[key].description = propDescription
      }
      if (propExample) {
        typeDesc[key].example = propExample
      }
    } else {
      let schemeDesc: any = {}
      let isStringEnum = true
      for (const k in d0) {
        if (typeof d0[k] === 'number') {
          isStringEnum = false
          break
        }
      }

      if (Array.isArray(d0)) {
        schemeDesc = {
          type: 'string',
          enum: Object.values(d0)
        }
      }
      // string enum
      else if (typeof d0 === 'object' && isStringEnum) {
        schemeDesc = {
          type: 'string',
          enum: Object.keys(d0)
        }
      }
      // number enum
      else if (typeof d0 === 'object' && !isStringEnum) {
        schemeDesc = {
          type: 'string',
          enum: Object.keys(d0).filter((k) => typeof d0[k] === 'number')
        }
      }
      // File type
      else if (d0 === File) {
        schemeDesc = {
          type: 'file'
        }
      } else if (d0 === Date) {
        if (isRequest) {
          schemeDesc = {
            type: 'string',
            example: '2000-01-01'
          }
        } else {
          const isNumber = typeof new Date(2000, 0, 1).toJSON() === 'number'
          schemeDesc = {
            type: isNumber ? 'integer' : 'string',
            example: isNumber ? new Date(2000, 0, 1).toJSON() : '2000-01-01'
          }
        }
      } else if (d0 === _Int || d0 === Number || d0 === BigInt) {
        schemeDesc = {
          type: d0 === Number ? 'number' : 'integer'
        }

        const min = Reflect.getMetadata('min', dType.prototype, key)
        if (min !== undefined) {
          schemeDesc.minimum = min
        }

        const max = Reflect.getMetadata('max', dType.prototype, key)
        if (max !== undefined) {
          schemeDesc.maximum = max
        }
      } else if (d0 === String) {
        schemeDesc = {
          type: 'string'
        }
        if (Reflect.getMetadata('email', dType.prototype, key)) {
          schemeDesc.format = 'email'
        }
        const pattern = Reflect.getMetadata('pattern', dType.prototype, key)
        if (pattern) {
          schemeDesc.pattern = pattern.toString().substring(1, pattern.toString().length - 1)
        }

        if (key.toLowerCase().indexOf('password') >= 0) {
          schemeDesc.format = 'password'
        }

        const minLen = Reflect.getMetadata('minLen', dType.prototype, key)
        if (minLen !== undefined) {
          schemeDesc.minLength = minLen
        }

        const maxLen = Reflect.getMetadata('maxLen', dType.prototype, key)
        if (maxLen !== undefined) {
          schemeDesc.maxLength = maxLen
        }
      } else {
        if (d0 === undefined) {
          schemeDesc = { type: 'object' }
        } else if (typeof d0 === 'string') {
          schemeDesc = {
            type: 'string',
            example: d0
          }
        } else {
          schemeDesc = {
            type: intToInteger(d0.name.toLowerCase())
          }
        }
      }

      if (isArray) {
        typeDesc[key] = {
          type: 'array',
          items: schemeDesc
        }
        const minLen = Reflect.getMetadata('minLen', dType.prototype, key)
        if (minLen !== undefined) {
          typeDesc[key].minItems = minLen
        }

        const maxLen = Reflect.getMetadata('maxLen', dType.prototype, key)
        if (maxLen !== undefined) {
          typeDesc[key].maxItems = maxLen
        }
      } else {
        typeDesc[key] = schemeDesc
      }

      let propDescription = Reflect.getMetadata('Api:PropDescription', dType.prototype, key)
      let propExample = Reflect.getMetadata('Api:PropExample', dType.prototype, key)

      if (swaggerJson.readTypeORMComment && !propDescription && global.typeormMetadataArgsStorage) {
        propDescription = global.typeormMetadataArgsStorage.columns.find((c) => {
          if (c.propertyName === key) {
            let proto = dType
            while (proto.name) {
              if (c.target === proto) {
                return true
              }
              proto = proto.__proto__
            }
          }
          return false
        })?.options.comment
      }

      if (propDescription) {
        typeDesc[key].description = propDescription
      }
      if (propExample) {
        typeDesc[key].example = propExample
      }
    }
  }

  const desc: any = { type: 'object', properties: typeDesc, description: '' }
  const requireKeys = getRequiredKeys(dType, isRequest)
  if (requireKeys.length > 0) {
    desc.required = requireKeys
  }
  return desc
}

@Controller('/-summer-swagger-ui')
export class SummerSwaggerUIController {
  @Get
  redirect(@Context ctx: Context) {
    const serverConfig: ServerConfig = getEnvConfig('SERVER_CONFIG')
    ctx.response.statusCode = 301
    ctx.response.headers = {
      Location: (serverConfig.basePath || '') + ctx.request.path + '/',
      'Cache-Control': 'no-store'
    }
  }

  @Get('/index')
  getSwaggerUIPage(
    @Query('urls.primaryName') @_ParamDeclareType([String], 'primaryName') @_Optional primaryName?: string
  ) {
    let allPages = allTags.map((at) => at.category || '')
    allPages = Array.from(new Set(allPages)).sort()
    let indexHTML = fs.readFileSync('./resource/swagger-res/index.html', { encoding: 'utf-8' })
    indexHTML = indexHTML.replace('{{TITLE}}', swaggerJson.info.title)

    const urls = allPages.map((ap) => ({
      name: ap || 'Default',
      url: 'swagger-docs.json' + (ap ? `?category=${encodeURIComponent(ap)}` : '')
    }))
    indexHTML = indexHTML.replace('//{{URLS}}', `urls:${JSON.stringify(urls)},\n'urls.primaryName':'${primaryName}',`)

    return indexHTML
  }

  @Get('/check-password')
  checkPassword() {
    if (swaggerJson.password) {
      if (swaggerJson.password !== Cookie.get('password')) {
        return ''
      }
    }
    return 'ok'
  }

  @Get('/swagger-docs.json')
  getSwaggerDocument(@Query @_ParamDeclareType([String], 'category') @_Optional category?: string) {
    if (swaggerJson.password) {
      if (swaggerJson.password !== Cookie.get('password')) {
        return ''
      }
    }

    swaggerJson.tags = []
    swaggerJson.paths = {}
    category = category || ''

    allTags.sort((a, b) => a.order - b.order)
    allTags
      .filter((t) => t.category === category)
      .forEach((tag) => {
        swaggerJson.tags.push({ name: tag.name, description: tag.description })
      })

    allApis.sort((a, b) => a.order! - b.order!)
    allApis.forEach((api) => {
      const apiCate = findCategory(api.controllerClass)
      if (apiCate !== category) {
        return
      }
      const routeInfos = findRoute(api.controllerClass, api.callMethod)
      for (const routeInfo of routeInfos) {
        const { path, requestMethod, params } = routeInfo
        let docPath = (path || '/').replace(/\/{2,}/g, '/')
        docPath = docPath.replace(/:([^/]+)/g, '{$1}')
        if (!swaggerJson.paths[docPath]) {
          swaggerJson.paths[docPath] = {}
        }
        const parameters: any[] = []
        let requestBody: any = undefined
        let isFormBody = false
        params.forEach((param) => {
          const paramType = getParamType(param.paramMethod.toString())
          if (paramType === 'body') {
            let [d0] = param.declareType
            d0 = convertType(d0)
            if (typeof d0 === 'function') {
              for (const key of getAllProps(d0)) {
                const declareType = Reflect.getMetadata('DeclareType', d0.prototype, key)
                if (convertType(declareType[0]) === File) {
                  isFormBody = true
                }
              }
            }
          }
        })

        // request structure
        params.forEach((param, inx) => {
          let [d0, d1, d2] = param.declareType
          d0 = convertType(d0)
          let paramType = getParamType(param.paramMethod.toString())
          if (isFormBody && paramType === 'body') {
            const formProps = getTypeDesc(d0, d2, true).properties

            const multipartFormBody = { type: 'object', properties: {}, required: [] as string[] }
            const required: string[] = []
            for (const filed in formProps) {
              let isRequired = true
              if (d0 && typeof d0 === 'function') {
                isRequired = !Reflect.getMetadata('optional', d0.prototype, filed)
                if (isRequired) {
                  required.push(filed)
                }
              }
              if (formProps[filed].type === 'file') {
                multipartFormBody.properties[filed] = { type: 'string', format: 'binary' }
              } else {
                multipartFormBody.properties[filed] = { type: formProps[filed].type }
              }
            }
            multipartFormBody.required = required
            requestBody = { content: { 'multipart/form-data': { schema: multipartFormBody } } }
          } else if (paramType === 'queries') {
            const props = getTypeDesc(d0, d2, true).properties
            for (const filed in props) {
              let isRequired = true
              if (d0 && typeof d0 === 'function') {
                isRequired = !Reflect.getMetadata('optional', d0.prototype, filed)
              }
              parameters.push({
                name: filed,
                in: 'query',
                description: props[filed].description || '',
                required: isRequired,
                example: props[filed].example,
                schema: {
                  type: props[filed].type
                }
              })
            }
          } else if (paramType !== 'body' && paramType) {
            const ptype = getType(d0)
            let isRequired = !(Reflect.getMetadata('optional', api.controller, api.callMethod) || [])[inx]

            const parameter: any = {
              name: param.paramValues[1] || param.paramValues[0],
              in: paramType,
              required: isRequired
            }

            const type = ptype || 'string'

            let schema: any = null
            if (d1 === Array) {
              schema = {
                type: 'array',
                items: getTypeDesc(d0, d2, true)
              }
            } else if (ptype === 'object') {
              schema = {
                ...getTypeDesc(d0, d2, true)
              }
            } else if (typeof d0 === 'object') {
              let isStringEnum = true
              for (const k in d0) {
                if (typeof d0[k] === 'number') {
                  isStringEnum = false
                  break
                }
              }
              schema = {
                type: 'string',
                enum: isStringEnum ? Object.keys(d0) : Object.keys(d0).filter((key) => typeof d0[key] === 'number')
              }
            } else {
              parameter.schema = { type }
            }

            if (schema) {
              schema.example = api.example?.request
              parameter.schema = schema
            }
            parameters.push(parameter)
          } else if (paramType === 'body') {
            const ptype = getType(d0)
            let schema: any = null
            if (d1 === Array) {
              schema = {
                type: 'array',
                items: getTypeDesc(d0, d2, true)
              }
            } else if (ptype === 'object') {
              schema = {
                ...getTypeDesc(d0, d2, true)
              }
            }
            requestBody = { content: { 'application/json': { schema } } }
          }
        })

        const errorResponse = {}
        if (api.errors) {
          api.errors.forEach((resError) => {
            if (!errorResponse[resError.statusCode]) {
              errorResponse[resError.statusCode] = {
                description: '',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                    examples: {}
                  }
                }
              }
            }
            const counter =
              Object.keys(errorResponse[resError.statusCode].content['application/json'].examples).length + 1
            if (resError instanceof ResponseError) {
              const codeDesc = resError.body?.message || resError.body?.msg || 'ERROR ' + counter
              errorResponse[resError.statusCode].content['application/json'].examples[codeDesc] = {
                value: resError.body
              }
            } else {
              const codeDesc =
                resError.description || resError.example?.message || resError.example?.msg || 'ERROR ' + counter
              errorResponse[resError.statusCode].content['application/json'].examples[codeDesc] = {
                value: resError.example
              }
            }
          })
        }

        const successResExample = api.example?.response

        let returnDeclareType = Reflect.getMetadata('ReturnDeclareType', api.controller, api.callMethod) || []
        const returnTypeParams = returnDeclareType[2] || []

        let [d0, d1] = returnDeclareType
        d0 = convertType(d0)

        const isArray = d1 === Array

        const security = [...findSecurity(api.controllerClass), ...(api.security || [])]

        // response structure
        let schema: any = {}
        if (!d0) {
          schema.type = 'string'
          schema.example = ''
        } else if (d0 === StreamingData) {
          schema.type = 'string'
          schema.format = 'binary'
          schema.example = '<Streaming Data>'
        } else if (isArray) {
          schema.type = 'array'
          schema.items = getTypeDesc(d0, returnTypeParams, false)
        } else if (getType(d0) === 'object') {
          schema = { ...schema, ...getTypeDesc(d0, returnTypeParams, false) }
        } else {
          schema = { type: getType(d0) }
        }

        if (successResExample) {
          schema.example = successResExample
        }

        swaggerJson.paths[docPath][requestMethod.toLowerCase()] = {
          tags: [findTag(api.controllerClass)],
          summary: api.summary,
          description: api.description,
          deprecated: api.deprecated,
          security: security.length > 0 ? security : [],
          operationId: md5(routeInfo.requestMethod + routeInfo.path).substring(0, 5),
          parameters,
          requestBody,
          responses: {
            200: {
              description: '',
              content: {
                [schema.type === 'string'
                  ? schema.format === 'binary'
                    ? 'application/octet-stream'
                    : 'text/html'
                  : 'application/json']: {
                  schema
                }
              }
            },
            ...errorResponse
          }
        }
      }
    })

    const serverConfig: ServerConfig = getEnvConfig('SERVER_CONFIG')
    const basePath = serverConfig.basePath
    if (basePath) {
      swaggerJson.servers = [{ url: basePath }]
    }
    const outPutJSON = { ...swaggerJson }
    // @ts-ignore
    delete outPutJSON.docPath
    delete outPutJSON.readTypeORMComment
    delete outPutJSON.password
    return outPutJSON
  }
}

export const getApiDoc = (ctx: Context) => {
  const match = matchPathMethod(ctx.request.path, ctx.request.method)
  if (match !== null) {
    const { controller, callMethod } = match
    for (const apiTag of allTags) {
      if (apiTag.controllerClass === controller.constructor) {
        for (const api of allApis) {
          if (api.controllerClass === controller.constructor && api.callMethod === callMethod) {
            return { api, apiGroup: apiTag }
          }
        }
      }
    }
  }
  return null
}

addPlugin(SwaggerPlugin)
export default SwaggerPlugin

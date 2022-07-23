import { SummerPlugin, getConfig, Controller, Get, Query, ServerConfig, addPlugin } from '@summer-js/summer'
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
  securityDefinitions?: Record<string, SecurityDefinitionBasic | SecurityDefinitionApiKey | SecurityDefinitionOAuth2>
}

interface SwaggerDoc {
  swagger: string
  docPath: string
  readTypeORMComment?: boolean
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
        security?: Record<string, string[]>[]
        deprecated?: boolean
      }
    >
  >
  securityDefinitions?: Record<string, SecurityDefinitionBasic | SecurityDefinitionApiKey | SecurityDefinitionOAuth2>
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
                let hasImport = false
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
                  m.getSourceFile().addImportDeclaration({
                    namedImports: ['ApiDoc'],
                    moduleSpecifier: '@summer-js/swagger'
                  })
                }
              }
              m.addDecorator({ name: 'ApiDoc', arguments: ["''"] })
              apiDoc = true
            }
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
      if (!fs.existsSync('./resource/swagger-res/' + f)) {
        fs.copyFileSync(swaggerUIPath + '/' + f, './resource/swagger-res/' + f)
      }
    })
    if (!fs.existsSync('./resource/swagger-res/index.html')) {
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
  const allProperties = []
  while (clazz.name) {
    allProperties.splice(0, 0, ...Reflect.getOwnMetadataKeys(clazz.prototype))
    clazz = clazz.__proto__
  }
  return allProperties
}

export const PropDoc = (description: string, example: any) => {
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
  errors?: { statusCode: number | string; description?: string; example: any }[]
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

const findSecurity = (controllerName: string) => {
  const tag = allTags.find((tag) => tag.controllerName === controllerName)
  if (tag) {
    return tag.security || []
  }
  return []
}

const findCategory = (controllerName: string) => {
  const tag = allTags.find((tag) => tag.controllerName === controllerName)
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

  if (type === Date || type === _DateTime) {
    return 'string'
  }

  if (type === _Int) {
    return 'integer'
  }

  if (type === File) {
    return 'file'
  }

  if (type === _TimeStamp) {
    return 'integer'
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
  for (const key of getAllProps(t)) {
    const required = !Reflect.getMetadata('optional', t.prototype, key)
    if (required) {
      requireKeys.push(key)
    }
  }
  return requireKeys
}

const getTypeDesc = (dType: any, typeParams: any[], isRequest: boolean) => {
  if (getType(dType) !== 'object') {
    return { type: getType(dType) }
  }

  const typeDesc = {}

  for (const key of getAllProps(dType)) {
    let [d0, d1, d2] = Reflect.getMetadata('DeclareType', dType.prototype, key) || []
    d0 = convertType(d0)

    if (typeof d0 === 'number') {
      const gDeclareType = typeParams[d0]
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
      if (isArray) {
        typeDesc[key] = { type: 'array', items: getTypeDesc(d0, typeParams, isRequest) }
      } else {
        const typeParams = d2
        typeDesc[key] = getTypeDesc(d0, typeParams, isRequest)
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

      // string enum
      if (typeof d0 === 'object' && isStringEnum) {
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
        schemeDesc = {
          type: 'string',
          format: 'date',
          example: '2012-12-12'
        }
      } else if (d0 === _DateTime) {
        schemeDesc = {
          type: 'string',
          format: 'date-time',
          example: '2012-12-12 12:12:12'
        }
      } else if (d0 === _TimeStamp) {
        schemeDesc = {
          type: 'integer',
          example: 1654030120101
        }
      } else if (d0 === _Int || d0 === Number || d0 === BigInt) {
        schemeDesc = {
          type: 'integer'
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
          schemeDesc = {
            type: 'string'
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

      // if (!propExample) {
      //   if (typeDesc[key].type === 'string' && propDescription) {
      //     propExample = propDescription
      //   }
      // }

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

@Controller('/swagger-ui')
export class SummerSwaggerUIController {
  @Get
  getSwaggerUIPage(@Query('urls.primaryName') @_ParamDeclareType([String]) @_Optional primaryName?: string) {
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
  getSwaggerDocument(@Query @_ParamDeclareType([String]) @_Optional category?: string) {
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
        params.forEach((param) => {
          let [d0, d1, d2] = param.declareType
          d0 = convertType(d0)
          let paramType = getParamType(param.paramMethod.toString())
          if (isFormBody && paramType === 'body') {
            const formProps = getTypeDesc(d0, d2, true).properties

            for (const filed in formProps) {
              let isRequired = false
              if (d0 && typeof d0 === 'function') {
                isRequired = !Reflect.getMetadata('optional', d0.prototype, filed)
              }
              parameters.push({
                name: filed,
                in: 'formData',
                required: isRequired,
                type: formProps[filed].type
              })
            }
          } else if (paramType === 'queries') {
            const props = getTypeDesc(d0, d2, true).properties
            for (const filed in props) {
              let isRequired = false
              if (d0 && typeof d0 === 'function') {
                isRequired = !Reflect.getMetadata('optional', d0.prototype, filed)
              }
              parameters.push({
                name: filed,
                in: 'query',
                description: '',
                required: isRequired,
                type: props[filed].type
              })
            }
          } else if (paramType) {
            const ptype = getType(d0)
            const parameter: any = {
              name: param.paramValues[0],
              in: paramType,
              required: ['path', 'body', 'formData'].includes(paramType) ? true : false
            }

            const type = ptype || 'string'

            let schema = null
            if (d1 === Array) {
              schema = {
                type: 'array',
                items: getTypeDesc(d0, d2, true)
              }
            } else if (ptype === 'object') {
              schema = {
                ...getTypeDesc(d0, d2, true)
              }
            } else if (parameter.in !== 'body') {
              parameter.type = type
            }

            if (schema) {
              schema.example = api.example?.request
              parameter.schema = schema
            }
            parameters.push(parameter)
          }
        })

        const errorResponse = {}
        if (api.errors) {
          api.errors.forEach((resError) => {
            const resExample = resError.example
            errorResponse[resError.statusCode] = {
              description: resError.description || '',
              schema: {
                type: typeof resExample === 'object' ? 'object' : 'string',
                properties: {},
                example: resExample
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

        const consumes = []
        if (parameters.find((p) => p.type === 'file')) {
          consumes.push('multipart/form-data')
        }

        const security = [...findSecurity(api.controllerName), ...(api.security || [])]

        // response structure
        let schema: any = {}
        if (!d0) {
          schema.type = 'string'
          schema.example = ''
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
          tags: [findTag(api.controllerName)],
          summary: api.summary,
          description: api.description,
          deprecated: api.deprecated,
          security: security.length > 0 ? security : [],
          operationId: api.summary || api.callMethod,
          consumes,
          // consumes: ['application/json'],
          // produces: ['application/json'],
          parameters,
          responses: {
            200: { schema, description: '' },
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
    delete outPutJSON.readTypeORMComment
    return outPutJSON
  }
}

addPlugin(SwaggerPlugin)
export default SwaggerPlugin

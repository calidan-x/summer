import { compile } from 'path-to-regexp'
import { locContainer } from './../loc'
import axios from 'axios'
import { validateAndConvertType } from './../validate-types'
import { requestMappingAssembler } from '../request-mapping'
import { getConfig } from './../config-handler'
import {
  _bodyConvertFunc,
  _pathParamConvertFunc,
  _headerConvertFunc,
  _queriesConvertFunc,
  _queryConvertFunc
} from './build-in'

type RequestConfig = (config: any) => { baseUrl: string; headers?: Record<string, string> }

interface RequestClientDecoratorType {
  (): ClassDecorator
  (target: any): void
}

export const createRequestClientDecorator = (requestConfig: RequestConfig): RequestClientDecoratorType => {
  return (...args: any) => {
    if (args.length === 0) {
      return (target: any) => {
        target.prototype._$requestConfig = requestConfig
        locContainer.paddingLocClass(target)
      }
    } else {
      args[0].prototype._$requestConfig = requestConfig
      locContainer.paddingLocClass(args[0])
    }
  }
}

export const Send =
  (requestMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS', requestPath: string) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const paramDefinitions = [...requestMappingAssembler.params]
    requestMappingAssembler.params = []
    descriptor.value = async function (...args: any) {
      const rConfig = (this as any)._$requestConfig(getConfig())
      let fullUrl = rConfig.baseUrl + requestPath
      let body
      let headers = rConfig.headers || {}
      let queries = {}
      const pathReplaceParam = {}

      for (let i = 0; i < args.length; i++) {
        const paramDefinition = paramDefinitions[i]
        const paramValues = paramDefinition.paramValues
        const paramName = paramValues.length > 1 ? paramValues[1] : paramValues[0]

        switch (paramDefinition.paramMethod) {
          case _bodyConvertFunc:
            body = args[i]
            break
          case _headerConvertFunc:
            headers[paramName] = args[i]
            break
          case _pathParamConvertFunc:
            pathReplaceParam[paramName] = args[i]
            break
          case _queriesConvertFunc:
            queries = args[i]
            break
          case _queryConvertFunc:
            queries[paramName] = args[i]
            break
        }
      }

      const url = new URL(fullUrl)
      const toPath = compile(url.pathname, { encode: encodeURIComponent })
      const fullPath = toPath(pathReplaceParam)

      let responseData = await (
        await axios.request({
          method: requestMethod,
          url: url.protocol + '//' + url.hostname + (url.port ? ':' + url.port : '') + fullPath,
          params: queries,
          data: body,
          headers
        })
      ).data

      const allErrors = []
      const [type, declareType] = Reflect.getMetadata('ReturnDeclareType', this, propertyKey)
      responseData = validateAndConvertType(type, declareType, '', responseData, allErrors, '', -1, this)
      if (allErrors.length) {
        throw new Error(JSON.stringify(allErrors))
      }
      return responseData
    }
  }

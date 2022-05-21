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

interface RequestOptions {
  host: string
  path: string
  method: string
  body?: string
  header?: Record<string, string>
}

export const createRequestDecorator = (requestConfig: RequestConfig) => {
  return (requestMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS', requestPath: string) =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const paramDefinitions = [...requestMappingAssembler.params]
      requestMappingAssembler.params = []
      descriptor.value = async (...args: any) => {
        const rConfig = requestConfig(getConfig())
        let fullPath = rConfig.baseUrl + requestPath
        let body
        let headers = rConfig.headers || {}
        let queries = {}

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
              fullPath = fullPath.replace(new RegExp(':' + paramName, 'g'), args[i])
              break
            case _queriesConvertFunc:
              queries = args[i]
              break
            case _queryConvertFunc:
              queries[paramName] = args[i]
              break
          }
        }
        const responseData = await (
          await axios.request({ method: requestMethod, url: fullPath, params: { queries, body, headers } })
        ).data

        // validateAndConvertType()
        return responseData
      }
    }
}

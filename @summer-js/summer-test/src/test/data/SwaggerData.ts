export const data = {
  swagger: '2.0',
  info: { title: 'Summer', version: '1.0.0' },
  tags: [
    { name: 'Person相关服务', description: '' },
    { name: '上传相关接口', description: '' },
    { name: 'Movie Apis', description: '' },
    { name: 'Swagger Apis', description: '' }
  ],
  paths: {
    '/persons': {
      get: {
        tags: ['Person相关服务'],
        summary: '获取用户列表',
        description: '描述描述描述描述描述',
        security: [],
        operationId: '获取用户列表',
        consumes: [],
        parameters: [{ name: 'pageIndex', in: 'query', required: false, type: 'string' }],
        responses: {
          '200': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  isActive: { type: 'boolean' }
                },
                description: ''
              }
            }
          }
        }
      },
      post: {
        tags: ['Person相关服务'],
        summary: '',
        security: [],
        operationId: 'addPerson',
        consumes: [],
        parameters: [
          {
            name: 'personRequest',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: { firstName: { type: 'string' }, lastName: { type: 'string' } },
              description: '',
              required: ['firstName', 'lastName']
            }
          }
        ],
        responses: { '200': { schema: { type: 'string', example: '' } } }
      }
    },
    '/persons/{id}': {
      get: {
        tags: ['Person相关服务'],
        summary: '',
        security: [],
        operationId: 'personInfo',
        consumes: [],
        parameters: [{ name: 'id', in: 'path', required: true, type: 'number' }],
        responses: {
          '200': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                isActive: { type: 'boolean' }
              },
              description: ''
            }
          }
        }
      }
    },
    '/upload': {
      post: {
        tags: ['上传相关接口'],
        summary: '上传文件',
        security: [],
        operationId: '上传文件',
        consumes: ['multipart/form-data'],
        parameters: [
          { name: 'field1', in: 'formData', required: true, type: 'string' },
          { name: 'field2', in: 'formData', type: 'integer' },
          { name: 'file', in: 'formData', required: true, type: 'file' }
        ],
        responses: { '200': { schema: { type: 'string', example: '' } } }
      }
    },
    '/movies': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movies',
        security: [],
        operationId: 'Get movies',
        consumes: [],
        parameters: [{ name: 'search', in: 'query', required: false, type: 'string' }],
        responses: {
          '200': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string', description: 'Name of the movie', example: '2022' },
                  year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                },
                description: ''
              }
            }
          }
        }
      },
      post: {
        tags: ['Movie Apis'],
        summary: 'Add new movie',
        security: [],
        operationId: 'Add new movie',
        consumes: [],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: { name: { type: 'string' }, year: { type: 'string' } },
              description: '',
              required: ['name', 'year']
            }
          }
        ],
        responses: {
          '200': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string', description: 'Name of the movie', example: '2022' },
                year: { type: 'string', description: 'Movie Release Year', example: '2022' }
              },
              description: ''
            }
          }
        }
      }
    },
    '/movies/{id}': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movie detail',
        security: [],
        operationId: 'Get movie detail',
        consumes: [],
        parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
        responses: {
          '200': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string', description: 'Name of the movie', example: '2022' },
                year: { type: 'string', description: 'Movie Release Year', example: '2022' }
              },
              description: ''
            }
          }
        }
      }
    },
    '/swagger-test': {
      get: {
        tags: ['Swagger Apis'],
        summary: 'Get Hello',
        description: 'desc',
        security: [],
        operationId: 'Get Hello',
        consumes: [],
        parameters: [],
        responses: { '200': { schema: { type: 'string' } } }
      }
    },
    '/swagger-test/swagger-params/{id}': {
      post: {
        tags: ['Swagger Apis'],
        summary: 'Doc Summary',
        description: 'desc',
        security: [],
        operationId: 'Doc Summary',
        consumes: [],
        parameters: [
          {
            name: 'body',
            in: 'body',
            required: true,
            schema: {
              type: 'object',
              properties: {
                string: { type: 'string' },
                number: { type: 'integer' },
                int: { type: 'integer' },
                boolean: { type: 'boolean' },
                Date: { type: 'string', format: 'date', example: '2012-12-12' },
                DateTime: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                TimeStamp: { type: 'integer', example: 1654030120101 },
                stringArray: { type: 'array', items: { type: 'string' } },
                intArray: { type: 'array', items: { type: 'integer' } },
                numberArray: { type: 'array', items: { type: 'integer' } },
                booleanArray: { type: 'array', items: { type: 'boolean' } },
                DateArray: { type: 'array', items: { type: 'string', format: 'date', example: '2012-12-12' } },
                DateTimeArray: {
                  type: 'array',
                  items: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' }
                },
                TimeStampArray: { type: 'array', items: { type: 'integer', example: 1654030120101 } },
                stringOptional: { type: 'string' },
                numberOptional: { type: 'integer' },
                intOptional: { type: 'integer' },
                booleanOptional: { type: 'boolean' },
                DateOptional: { type: 'string', format: 'date', example: '2012-12-12' },
                DateTimeOptional: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                TimeStampOptional: { type: 'integer', example: 1654030120101 },
                obj: {
                  type: 'object',
                  properties: {
                    a: { type: 'string', description: 'A', example: 'A Value' },
                    b: { type: 'integer', description: 'B', example: 1 }
                  },
                  description: '',
                  required: ['a', 'b']
                },
                objArray: {
                  type: 'object',
                  properties: {
                    a: { type: 'string', description: 'A', example: 'A Value' },
                    b: { type: 'integer', description: 'B', example: 1 }
                  },
                  description: '',
                  required: ['a', 'b']
                },
                num: { type: 'integer', minimum: 10, maximum: 20 },
                len: { type: 'string', minLength: 10, maxLength: 20 },
                lenItems: {
                  type: 'array',
                  items: { type: 'string', minLength: 10, maxLength: 20 },
                  minItems: 10,
                  maxItems: 20
                },
                regExp: { type: 'string', pattern: '/regExp/' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
                desc: { type: 'string', description: 'Desc', example: 'Example' }
              },
              description: '',
              required: [
                'string',
                'number',
                'int',
                'boolean',
                'Date',
                'DateTime',
                'TimeStamp',
                'stringArray',
                'intArray',
                'numberArray',
                'booleanArray',
                'DateArray',
                'DateTimeArray',
                'TimeStampArray',
                'obj',
                'objArray',
                'num',
                'len',
                'lenItems',
                'regExp',
                'email',
                'password',
                'desc'
              ]
            }
          },
          { name: 'query', in: 'query', required: false, type: 'string' },
          { name: 'boolQuery', in: 'query', required: false, type: 'boolean' },
          { name: 'q1', in: 'query', description: '', required: true, type: 'string' },
          { name: 'q2', in: 'query', description: '', required: true, type: 'integer' },
          { name: 'id', in: 'path', required: true, type: 'integer' },
          { name: 'header', in: 'header', required: false, type: 'string' }
        ],
        responses: {
          '200': { schema: { type: 'string', example: '' } },
          '404': {
            description: '',
            schema: { type: 'object', properties: {}, example: { code: 10000, msg: 'not found' } }
          }
        }
      }
    },
    '/swagger-test/swagger-string-array-request': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'stringArrayRequest',
        consumes: [],
        parameters: [
          { name: 'array', in: 'body', required: true, schema: { type: 'array', items: { type: 'string' } } }
        ],
        responses: { '200': { schema: { type: 'array', items: { type: 'string' } } } }
      }
    },
    '/swagger-test/swagger-obj-array-request': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'objArrayRequest',
        consumes: [],
        parameters: [
          {
            name: 'objArray',
            in: 'body',
            required: true,
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  a: { type: 'string', description: 'A', example: 'A Value' },
                  b: { type: 'integer', description: 'B', example: 1 }
                },
                description: '',
                required: ['a', 'b']
              }
            }
          }
        ],
        responses: {
          '200': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  a: { type: 'string', description: 'A', example: 'A Value' },
                  b: { type: 'integer', description: 'B', example: 1 }
                },
                description: ''
              }
            }
          }
        }
      }
    },
    '/swagger-test/swagger-return-string-async': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnString',
        consumes: [],
        parameters: [],
        responses: { '200': { schema: { type: 'string' } } }
      }
    },
    '/swagger-test/swagger-return-int-async': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnNumber',
        consumes: [],
        parameters: [],
        responses: { '200': { schema: { type: 'number' } } }
      }
    },
    '/swagger-test/swagger-return-object-async': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnObject',
        consumes: [],
        parameters: [],
        responses: {
          '200': {
            schema: {
              type: 'object',
              properties: {
                string: { type: 'string' },
                number: { type: 'integer' },
                int: { type: 'integer' },
                boolean: { type: 'boolean' },
                Date: { type: 'string', format: 'date', example: '2012-12-12' },
                DateTime: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                TimeStamp: { type: 'integer', example: 1654030120101 },
                stringArray: { type: 'array', items: { type: 'string' } },
                intArray: { type: 'array', items: { type: 'integer' } },
                numberArray: { type: 'array', items: { type: 'integer' } },
                booleanArray: { type: 'array', items: { type: 'boolean' } },
                DateArray: { type: 'array', items: { type: 'string', format: 'date', example: '2012-12-12' } },
                DateTimeArray: {
                  type: 'array',
                  items: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' }
                },
                TimeStampArray: { type: 'array', items: { type: 'integer', example: 1654030120101 } },
                stringOptional: { type: 'string' },
                numberOptional: { type: 'integer' },
                intOptional: { type: 'integer' },
                booleanOptional: { type: 'boolean' },
                DateOptional: { type: 'string', format: 'date', example: '2012-12-12' },
                DateTimeOptional: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                TimeStampOptional: { type: 'integer', example: 1654030120101 },
                obj: {
                  type: 'object',
                  properties: {
                    a: { type: 'string', description: 'A', example: 'A Value' },
                    b: { type: 'integer', description: 'B', example: 1 }
                  },
                  description: ''
                },
                objArray: {
                  type: 'object',
                  properties: {
                    a: { type: 'string', description: 'A', example: 'A Value' },
                    b: { type: 'integer', description: 'B', example: 1 }
                  },
                  description: ''
                },
                num: { type: 'integer', minimum: 10, maximum: 20 },
                len: { type: 'string', minLength: 10, maxLength: 20 },
                lenItems: {
                  type: 'array',
                  items: { type: 'string', minLength: 10, maxLength: 20 },
                  minItems: 10,
                  maxItems: 20
                },
                regExp: { type: 'string', pattern: '/regExp/' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
                desc: { type: 'string', description: 'Desc', example: 'Example' }
              },
              description: ''
            }
          }
        }
      }
    },
    '/swagger-test/swagger-return-string-array-async': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnArray',
        consumes: [],
        parameters: [],
        responses: { '200': { schema: { type: 'array', items: { type: 'string' } } } }
      }
    },
    '/swagger-test/swagger-return-obj-array-async': {
      patch: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnObjectArray',
        consumes: [],
        parameters: [],
        responses: {
          '200': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  string: { type: 'string' },
                  number: { type: 'integer' },
                  int: { type: 'integer' },
                  boolean: { type: 'boolean' },
                  Date: { type: 'string', format: 'date', example: '2012-12-12' },
                  DateTime: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                  TimeStamp: { type: 'integer', example: 1654030120101 },
                  stringArray: { type: 'array', items: { type: 'string' } },
                  intArray: { type: 'array', items: { type: 'integer' } },
                  numberArray: { type: 'array', items: { type: 'integer' } },
                  booleanArray: { type: 'array', items: { type: 'boolean' } },
                  DateArray: { type: 'array', items: { type: 'string', format: 'date', example: '2012-12-12' } },
                  DateTimeArray: {
                    type: 'array',
                    items: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' }
                  },
                  TimeStampArray: { type: 'array', items: { type: 'integer', example: 1654030120101 } },
                  stringOptional: { type: 'string' },
                  numberOptional: { type: 'integer' },
                  intOptional: { type: 'integer' },
                  booleanOptional: { type: 'boolean' },
                  DateOptional: { type: 'string', format: 'date', example: '2012-12-12' },
                  DateTimeOptional: { type: 'string', format: 'date-time', example: '2012-12-12 12:12:12' },
                  TimeStampOptional: { type: 'integer', example: 1654030120101 },
                  obj: {
                    type: 'object',
                    properties: {
                      a: { type: 'string', description: 'A', example: 'A Value' },
                      b: { type: 'integer', description: 'B', example: 1 }
                    },
                    description: ''
                  },
                  objArray: {
                    type: 'object',
                    properties: {
                      a: { type: 'string', description: 'A', example: 'A Value' },
                      b: { type: 'integer', description: 'B', example: 1 }
                    },
                    description: ''
                  },
                  num: { type: 'integer', minimum: 10, maximum: 20 },
                  len: { type: 'string', minLength: 10, maxLength: 20 },
                  lenItems: {
                    type: 'array',
                    items: { type: 'string', minLength: 10, maxLength: 20 },
                    minItems: 10,
                    maxItems: 20
                  },
                  regExp: { type: 'string', pattern: '/regExp/' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  desc: { type: 'string', description: 'Desc', example: 'Example' }
                },
                description: ''
              }
            }
          }
        }
      }
    },
    '/swagger-test/swagger-security': {
      get: {
        tags: ['Swagger Apis'],
        summary: 'security',
        security: [{ AppAuth: [] }],
        operationId: 'security',
        consumes: [],
        parameters: [],
        responses: { '200': { schema: { type: 'string' } } }
      }
    }
  },
  securityDefinitions: { AppAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } },
  basePath: ''
}
export const data = {
  openapi: '3.0.3',
  info: { title: 'Summer', version: '1.0.0' },
  tags: [
    { name: 'Person相关服务', description: '' },
    { name: 'Todo Apis', description: '' },
    { name: '上传相关接口', description: '' },
    { name: 'Generic', description: '' },
    { name: 'Movie Apis', description: '' },
    { name: 'Movie Apis', description: '' },
    { name: 'Swagger Apis', description: '' }
  ],
  paths: {
    '/persons': {
      get: {
        tags: ['Person相关服务'],
        summary: '获取用户列表',
        security: [],
        operationId: '21551',
        parameters: [{ name: 'pageIndex', in: 'query', required: false, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
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
          '400': {
            description: '',
            content: {
              'application/json': {
                schema: { type: 'object' },
                examples: {
                  错误1: { value: { message: '错误1' } },
                  错误2: { value: { message: '错误2' } },
                  请求错误: { value: '错误3' },
                  错误5: { value: { message: '错误5' } }
                }
              }
            }
          },
          '500': {
            description: '',
            content: { 'application/json': { schema: { type: 'object' }, examples: { 'ERROR 1': { value: '错误' } } } }
          }
        }
      },
      post: {
        tags: ['Person相关服务'],
        summary: '',
        security: [],
        operationId: '441d6',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { firstName: { type: 'string' }, lastName: { type: 'string' } },
                description: '',
                required: ['firstName', 'lastName']
              }
            }
          }
        },
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/persons/{id}': {
      get: {
        tags: ['Person相关服务'],
        summary: '',
        security: [],
        operationId: '8e99c',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    isActive: { type: 'boolean' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/persons/search': {
      get: {
        tags: ['Person相关服务'],
        summary: '',
        security: [],
        operationId: '804b8',
        parameters: [
          {
            name: 'firstName',
            in: 'query',
            description: 'query first name',
            required: true,
            example: 'John',
            schema: { type: 'string' }
          },
          { name: 'lastName', in: 'query', description: '', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/todos': {
      get: {
        tags: ['Todo Apis'],
        summary: '',
        security: [],
        operationId: 'ad91d',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      content: { type: 'string', description: '内容' },
                      isDone: { type: 'boolean' }
                    },
                    description: ''
                  }
                }
              }
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
        operationId: '764c3',
        parameters: [],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  field1: { type: 'string' },
                  field2: { type: 'integer' },
                  file: { type: 'string', format: 'binary' }
                },
                required: ['field1', 'file']
              }
            }
          }
        },
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/generic-type': {
      post: {
        tags: ['Generic'],
        summary: '',
        security: [],
        operationId: '639e5',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  int: { type: 'integer' },
                  dir: { type: 'array', items: { type: 'string', enum: ['Up', 'Down'] } },
                  intArr: { type: 'array', items: { type: 'integer' } },
                  field1: { type: 'array', items: { type: 'string' } },
                  field2: { type: 'number' },
                  obj: {
                    type: 'object',
                    properties: { a: { type: 'number' }, b: { type: 'string' } },
                    description: '',
                    required: ['a', 'b']
                  },
                  date: { type: 'string', example: '2000-01-01' },
                  g: {
                    type: 'object',
                    properties: {
                      a: { type: 'number' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '2000-01-01' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  z: {
                    type: 'object',
                    properties: {
                      a: { type: 'boolean' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '2000-01-01' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  x: {
                    type: 'object',
                    properties: {
                      a: { type: 'number' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '2000-01-01' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  w: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { a: { type: 'number' }, b: { type: 'string' } },
                      description: '',
                      required: ['a', 'b']
                    }
                  },
                  o: { type: 'array', items: { type: 'string' } }
                },
                description: '',
                required: ['int', 'dir', 'intArr', 'field1', 'field2', 'obj', 'date', 'g', 'z', 'x', 'w', 'o']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    int: { type: 'integer' },
                    dir: { type: 'array', items: { type: 'string', enum: ['Up', 'Down'] } },
                    intArr: { type: 'array', items: { type: 'integer' } },
                    field1: { type: 'array', items: { type: 'string' } },
                    field2: { type: 'number' },
                    obj: {
                      type: 'object',
                      properties: { a: { type: 'number' }, b: { type: 'string' } },
                      description: ''
                    },
                    date: { type: 'string', example: '2000-01-01' },
                    g: {
                      type: 'object',
                      properties: {
                        a: { type: 'number' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '2000-01-01' }
                      },
                      description: ''
                    },
                    z: {
                      type: 'object',
                      properties: {
                        a: { type: 'boolean' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '2000-01-01' }
                      },
                      description: ''
                    },
                    x: {
                      type: 'object',
                      properties: {
                        a: { type: 'number' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '2000-01-01' }
                      },
                      description: ''
                    },
                    w: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { a: { type: 'number' }, b: { type: 'string' } },
                        description: ''
                      }
                    },
                    o: { type: 'array', items: { type: 'string' } }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/generic-type/mixed-object-return': {
      get: {
        tags: ['Generic'],
        summary: '',
        security: [],
        operationId: 'c849e',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/movies': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movies',
        security: [],
        operationId: '3b8fc',
        parameters: [{ name: 'search', in: 'query', required: false, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string', description: 'Name of the movie', example: '2022' },
                      year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                    },
                    description: ''
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Movie Apis'],
        summary: 'Add new movie',
        security: [],
        operationId: 'a703b',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, year: { type: 'string' } },
                description: '',
                required: ['name', 'year']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string', description: 'Name of the movie', example: '2022' },
                    year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                  },
                  description: ''
                }
              }
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
        operationId: '588ff',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string', description: 'Name of the movie', example: '2022' },
                    year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/v2/movies': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movies',
        security: [],
        operationId: '04cd4',
        parameters: [{ name: 'search', in: 'query', required: false, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      name: { type: 'string', description: 'Name of the movie', example: '2022' },
                      year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                    },
                    description: ''
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Movie Apis'],
        summary: 'Add new movie',
        security: [],
        operationId: '10122',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, year: { type: 'string' } },
                description: '',
                required: ['name', 'year']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string', description: 'Name of the movie', example: '2022' },
                    year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/v2/movies/{id}': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movie detail',
        security: [],
        operationId: '2a9ba',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string', description: 'Name of the movie', example: '2022' },
                    year: { type: 'string', description: 'Movie Release Year', example: '2022' }
                  },
                  description: ''
                }
              }
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
        operationId: 'b5020',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/unknown': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'e0aef',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/multi-return': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'cd4bd',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { example: '<UNKNOWN>' },
                    pageNumber: { type: 'number' },
                    pageSize: { type: 'number' },
                    total: { type: 'number' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/swagger-test/paging': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'ea7a2',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          a: { type: 'string', description: 'A', example: 'A Value' },
                          b: { type: 'integer', description: 'B', example: 1 }
                        },
                        description: ''
                      }
                    },
                    pageNumber: { type: 'number' },
                    pageSize: { type: 'number' },
                    total: { type: 'number' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/swagger-test/swagger-params/{id}': {
      post: {
        tags: ['Swagger Apis'],
        summary: 'Doc Summary',
        description: 'desc',
        security: [],
        operationId: 'c8946',
        parameters: [
          { name: 'query', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'boolQuery', in: 'query', required: true, schema: { type: 'boolean' } },
          { name: 'q1', in: 'query', description: '', required: true, schema: { type: 'string' } },
          { name: 'q2', in: 'query', description: '', required: true, schema: { type: 'integer' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'header', in: 'header', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  string: { type: 'string' },
                  number: { type: 'number' },
                  int: { type: 'integer' },
                  boolean: { type: 'boolean' },
                  Date: { type: 'string', example: '2000-01-01' },
                  stringArray: { type: 'array', items: { type: 'string' } },
                  intArray: { type: 'array', items: { type: 'integer' } },
                  numberArray: { type: 'array', items: { type: 'number' } },
                  booleanArray: { type: 'array', items: { type: 'boolean' } },
                  DateArray: { type: 'array', items: { type: 'string', example: '2000-01-01' } },
                  stringOptional: { type: 'string' },
                  numberOptional: { type: 'number' },
                  intOptional: { type: 'integer' },
                  booleanOptional: { type: 'boolean' },
                  DateOptional: { type: 'string', example: '2000-01-01' },
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
                  },
                  num: { type: 'integer', minimum: 10, maximum: 20 },
                  len: { type: 'string', minLength: 10, maxLength: 20 },
                  lenItems: {
                    type: 'array',
                    items: { type: 'string', minLength: 10, maxLength: 20 },
                    minItems: 10,
                    maxItems: 20
                  },
                  regExp: { type: 'string', pattern: 'regExp' },
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
                  'stringArray',
                  'intArray',
                  'numberArray',
                  'booleanArray',
                  'DateArray',
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
            }
          }
        },
        responses: {
          '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } },
          '400': {
            description: '',
            content: {
              'application/json': {
                schema: { type: 'object' },
                examples: { 'request error': { value: { code: 10000, msg: 'request error' } } }
              }
            }
          },
          '500': {
            description: '',
            content: {
              'application/json': { schema: { type: 'object' }, examples: { 'ERROR 1': { value: 'server error' } } }
            }
          }
        }
      }
    },
    '/swagger-test/swagger-string-array-request': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '543db',
        parameters: [],
        requestBody: { content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } } },
        responses: {
          '200': {
            description: '',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } }
          }
        }
      }
    },
    '/swagger-test/swagger-obj-array-request': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'fca75',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
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
          }
        },
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
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
        }
      }
    },
    '/swagger-test/swagger-return-string-async': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '0d129',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/swagger-return-int-async': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '789db',
        parameters: [],
        responses: { '200': { description: '', content: { 'application/json': { schema: { type: 'number' } } } } }
      }
    },
    '/swagger-test/swagger-return-object-async': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '92b72',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    string: { type: 'string' },
                    number: { type: 'number' },
                    int: { type: 'integer' },
                    boolean: { type: 'boolean' },
                    Date: { type: 'string', example: '2000-01-01' },
                    stringArray: { type: 'array', items: { type: 'string' } },
                    intArray: { type: 'array', items: { type: 'integer' } },
                    numberArray: { type: 'array', items: { type: 'number' } },
                    booleanArray: { type: 'array', items: { type: 'boolean' } },
                    DateArray: { type: 'array', items: { type: 'string', example: '2000-01-01' } },
                    stringOptional: { type: 'string' },
                    numberOptional: { type: 'number' },
                    intOptional: { type: 'integer' },
                    booleanOptional: { type: 'boolean' },
                    DateOptional: { type: 'string', example: '2000-01-01' },
                    obj: {
                      type: 'object',
                      properties: {
                        a: { type: 'string', description: 'A', example: 'A Value' },
                        b: { type: 'integer', description: 'B', example: 1 }
                      },
                      description: ''
                    },
                    objArray: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          a: { type: 'string', description: 'A', example: 'A Value' },
                          b: { type: 'integer', description: 'B', example: 1 }
                        },
                        description: ''
                      }
                    },
                    num: { type: 'integer', minimum: 10, maximum: 20 },
                    len: { type: 'string', minLength: 10, maxLength: 20 },
                    lenItems: {
                      type: 'array',
                      items: { type: 'string', minLength: 10, maxLength: 20 },
                      minItems: 10,
                      maxItems: 20
                    },
                    regExp: { type: 'string', pattern: 'regExp' },
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
      }
    },
    '/swagger-test/swagger-return-string-array-async': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'd7575',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } }
          }
        }
      }
    },
    '/swagger-test/swagger-return-obj-array-async': {
      patch: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '020db',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      string: { type: 'string' },
                      number: { type: 'number' },
                      int: { type: 'integer' },
                      boolean: { type: 'boolean' },
                      Date: { type: 'string', example: '2000-01-01' },
                      stringArray: { type: 'array', items: { type: 'string' } },
                      intArray: { type: 'array', items: { type: 'integer' } },
                      numberArray: { type: 'array', items: { type: 'number' } },
                      booleanArray: { type: 'array', items: { type: 'boolean' } },
                      DateArray: { type: 'array', items: { type: 'string', example: '2000-01-01' } },
                      stringOptional: { type: 'string' },
                      numberOptional: { type: 'number' },
                      intOptional: { type: 'integer' },
                      booleanOptional: { type: 'boolean' },
                      DateOptional: { type: 'string', example: '2000-01-01' },
                      obj: {
                        type: 'object',
                        properties: {
                          a: { type: 'string', description: 'A', example: 'A Value' },
                          b: { type: 'integer', description: 'B', example: 1 }
                        },
                        description: ''
                      },
                      objArray: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            a: { type: 'string', description: 'A', example: 'A Value' },
                            b: { type: 'integer', description: 'B', example: 1 }
                          },
                          description: ''
                        }
                      },
                      num: { type: 'integer', minimum: 10, maximum: 20 },
                      len: { type: 'string', minLength: 10, maxLength: 20 },
                      lenItems: {
                        type: 'array',
                        items: { type: 'string', minLength: 10, maxLength: 20 },
                        minItems: 10,
                        maxItems: 20
                      },
                      regExp: { type: 'string', pattern: 'regExp' },
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
        }
      }
    },
    '/swagger-test/swagger-security': {
      get: {
        tags: ['Swagger Apis'],
        summary: 'security',
        security: [{ AppAuth: [] }],
        operationId: 'c7bdc',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/swagger-extends-class': {
      post: {
        tags: ['Swagger Apis'],
        summary: 'extends class',
        security: [],
        operationId: 'c8491',
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  a: { type: 'string', description: 'A', example: 'A Value' },
                  b: { type: 'integer', description: 'B', example: 1 },
                  c: { type: 'string' },
                  d: { type: 'number' }
                },
                description: '',
                required: ['a', 'b', 'c', 'd']
              }
            }
          }
        },
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    a: { type: 'string', description: 'A', example: 'A Value' },
                    b: { type: 'integer', description: 'B', example: 1 },
                    c: { type: 'string' },
                    d: { type: 'number' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/swagger-test/interface-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '7e5a1',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/object-return': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '58ca0',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/wrong-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '51d82',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/wrong-return2': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '80584',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/service-object-convert-type': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '2f310',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { field1: { type: 'string' }, field2: { type: 'number' } },
                        description: ''
                      }
                    },
                    pageNumber: { type: 'number' },
                    pageSize: { type: 'number' },
                    total: { type: 'number' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/swagger-test/service-mixed-type-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '9877f',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/service-paging-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'b45ee',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { field1: { type: 'string' }, field2: { type: 'number' } },
                        description: ''
                      }
                    },
                    pageNumber: { type: 'number' },
                    pageSize: { type: 'number' },
                    total: { type: 'number' }
                  },
                  description: ''
                }
              }
            }
          }
        }
      }
    },
    '/swagger-test/file': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: '89811',
        parameters: [],
        responses: {
          '200': {
            description: '',
            content: {
              'application/octet-stream': { schema: { type: 'string', format: 'binary', example: '<Streaming Data>' } }
            }
          }
        }
      }
    }
  },
  components: { securitySchemes: { AppAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } } }
}

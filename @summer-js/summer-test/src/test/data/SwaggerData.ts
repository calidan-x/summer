export const data = {
  openapi: '3.0.3',
  info: { title: 'Summer', version: '1.0.0' },
  tags: [
    { name: 'Person相关服务', description: '' },
    { name: 'Todo Apis', description: '' },
    { name: '上传相关接口', description: '' },
    { name: 'Generic', description: '' },
    { name: 'Movie Apis', description: '' },
    { name: 'Swagger Apis', description: '' }
  ],
  paths: {
    '/persons': {
      get: {
        tags: ['Person相关服务'],
        summary: '获取用户列表',
        security: [],
        operationId: '获取用户列表',
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
        operationId: 'addPerson',
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
        operationId: 'personInfo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'number' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
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
        }
      }
    },
    '/todos': {
      get: {
        tags: ['Todo Apis'],
        summary: '',
        security: [],
        operationId: 'list',
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
                      id: { type: 'integer' },
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
        operationId: '上传文件',
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
        operationId: 'genericRequest',
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
                  field2: { type: 'integer' },
                  obj: {
                    type: 'object',
                    properties: { a: { type: 'integer' }, b: { type: 'string' } },
                    description: '',
                    required: ['a', 'b']
                  },
                  date: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
                  g: {
                    type: 'object',
                    properties: {
                      a: { type: 'integer' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  z: {
                    type: 'object',
                    properties: {
                      a: { type: 'boolean' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  x: {
                    type: 'object',
                    properties: {
                      a: { type: 'integer' },
                      b: { type: 'string' },
                      d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                    },
                    description: '',
                    required: ['a', 'b', 'd']
                  },
                  w: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { a: { type: 'integer' }, b: { type: 'string' } },
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
                    field2: { type: 'integer' },
                    obj: {
                      type: 'object',
                      properties: { a: { type: 'integer' }, b: { type: 'string' } },
                      description: ''
                    },
                    date: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
                    g: {
                      type: 'object',
                      properties: {
                        a: { type: 'integer' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                      },
                      description: ''
                    },
                    z: {
                      type: 'object',
                      properties: {
                        a: { type: 'boolean' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                      },
                      description: ''
                    },
                    x: {
                      type: 'object',
                      properties: {
                        a: { type: 'integer' },
                        b: { type: 'string' },
                        d: { type: 'string', example: '1999-12-31T16:00:00.000Z' }
                      },
                      description: ''
                    },
                    w: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: { a: { type: 'integer' }, b: { type: 'string' } },
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
        operationId: 'mixedObjectReturn',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/movies': {
      get: {
        tags: ['Movie Apis'],
        summary: 'Get movies',
        security: [],
        operationId: 'Get movies',
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
                      id: { type: 'integer' },
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
        operationId: 'Add new movie',
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
                    id: { type: 'integer' },
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
        operationId: 'Get movie detail',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: '',
            content: {
              'application/json': {
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
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/unknown': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'unknown',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/multi-return': {
      get: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'promiseUnknown',
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
                    pageNumber: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' }
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
        operationId: 'paging',
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
                    pageNumber: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' }
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
        operationId: 'Doc Summary',
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
                  number: { type: 'integer' },
                  int: { type: 'integer' },
                  boolean: { type: 'boolean' },
                  Date: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
                  stringArray: { type: 'array', items: { type: 'string' } },
                  intArray: { type: 'array', items: { type: 'integer' } },
                  numberArray: { type: 'array', items: { type: 'integer' } },
                  booleanArray: { type: 'array', items: { type: 'boolean' } },
                  DateArray: { type: 'array', items: { type: 'string', example: '1999-12-31T16:00:00.000Z' } },
                  stringOptional: { type: 'string' },
                  numberOptional: { type: 'integer' },
                  intOptional: { type: 'integer' },
                  booleanOptional: { type: 'boolean' },
                  DateOptional: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
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
        operationId: 'stringArrayRequest',
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
        operationId: 'objArrayRequest',
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
        operationId: 'returnString',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/swagger-return-int-async': {
      post: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnNumber',
        parameters: [],
        responses: { '200': { description: '', content: { 'application/json': { schema: { type: 'number' } } } } }
      }
    },
    '/swagger-test/swagger-return-object-async': {
      delete: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'returnObject',
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
                    number: { type: 'integer' },
                    int: { type: 'integer' },
                    boolean: { type: 'boolean' },
                    Date: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
                    stringArray: { type: 'array', items: { type: 'string' } },
                    intArray: { type: 'array', items: { type: 'integer' } },
                    numberArray: { type: 'array', items: { type: 'integer' } },
                    booleanArray: { type: 'array', items: { type: 'boolean' } },
                    DateArray: { type: 'array', items: { type: 'string', example: '1999-12-31T16:00:00.000Z' } },
                    stringOptional: { type: 'string' },
                    numberOptional: { type: 'integer' },
                    intOptional: { type: 'integer' },
                    booleanOptional: { type: 'boolean' },
                    DateOptional: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
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
        operationId: 'returnArray',
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
        operationId: 'returnObjectArray',
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
                      number: { type: 'integer' },
                      int: { type: 'integer' },
                      boolean: { type: 'boolean' },
                      Date: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
                      stringArray: { type: 'array', items: { type: 'string' } },
                      intArray: { type: 'array', items: { type: 'integer' } },
                      numberArray: { type: 'array', items: { type: 'integer' } },
                      booleanArray: { type: 'array', items: { type: 'boolean' } },
                      DateArray: { type: 'array', items: { type: 'string', example: '1999-12-31T16:00:00.000Z' } },
                      stringOptional: { type: 'string' },
                      numberOptional: { type: 'integer' },
                      intOptional: { type: 'integer' },
                      booleanOptional: { type: 'boolean' },
                      DateOptional: { type: 'string', example: '1999-12-31T16:00:00.000Z' },
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
        operationId: 'security',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string' } } } } }
      }
    },
    '/swagger-test/swagger-extends-class': {
      post: {
        tags: ['Swagger Apis'],
        summary: 'extends class',
        security: [],
        operationId: 'extends class',
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
                  d: { type: 'integer' }
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
                    d: { type: 'integer' }
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
        operationId: 'getInterface',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/wrong-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'getWringReturn',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/wrong-return2': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'getWringReturn2',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/service-object-convert-type': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'getServiceData',
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
                        properties: { field1: { type: 'string' }, field2: { type: 'integer' } },
                        description: ''
                      }
                    },
                    pageNumber: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' }
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
        operationId: 'serviceMixTypeClass',
        parameters: [],
        responses: { '200': { description: '', content: { 'text/html': { schema: { type: 'string', example: '' } } } } }
      }
    },
    '/swagger-test/service-paging-return': {
      put: {
        tags: ['Swagger Apis'],
        summary: '',
        security: [],
        operationId: 'getServicePagingData',
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
                        properties: { field1: { type: 'string' }, field2: { type: 'integer' } },
                        description: ''
                      }
                    },
                    pageNumber: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    total: { type: 'integer' }
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
  components: { securitySchemes: { AppAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } } }
}

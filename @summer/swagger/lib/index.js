"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummerSwaggerUIController = exports.ApiDoc = exports.ApiGroupDoc = void 0;
const summer_1 = require("@summer/summer");
const request_mapping_1 = require("@summer/summer/lib/request-mapping");
const swagger_ui_dist_1 = require("swagger-ui-dist");
const fs_1 = __importDefault(require("fs"));
const swaggerJson = {
    swagger: '2.0',
    info: { title: '' },
    host: '',
    basePath: '',
    tags: [],
    schemes: ['http'],
    paths: {}
};
class default_1 {
    constructor() {
        this.configKey = 'SWAGGER_CONFIG';
    }
    async init(config) {
        Object.assign(swaggerJson, config);
        const serverConfig = (0, summer_1.loadConfig)()['SERVER_CONFIG'];
        if (serverConfig) {
            if (!serverConfig.serveStatic) {
                serverConfig.serveStatic = { paths: {}, indexFiles: [] };
            }
            else {
                if (!serverConfig.serveStatic.paths) {
                    serverConfig.serveStatic.paths = {};
                }
                if (!serverConfig.serveStatic.indexFiles) {
                    serverConfig.serveStatic.indexFiles = [];
                }
            }
            serverConfig.serveStatic.paths[config.swaggerDocPath] = 'resource/swagger-ui';
        }
    }
    getAutoImportContent() {
        return 'import { SummerSwaggerUIController } from "@summer/swagger";\nSummerSwaggerUIController;\n';
    }
    async postCompile() {
        let swaggerUIPath = (0, swagger_ui_dist_1.getAbsoluteFSPath)();
        if (!fs_1.default.existsSync(swaggerUIPath)) {
            swaggerUIPath = '../../node_modules/swagger-ui-dist';
        }
        let swaggerPluginPath = './node_modules/@summer/swagger';
        if (!fs_1.default.existsSync(swaggerPluginPath)) {
            swaggerPluginPath = '../../node_modules/@summer/swagger';
        }
        if (!fs_1.default.existsSync('./resource')) {
            fs_1.default.mkdirSync('./resource');
        }
        if (!fs_1.default.existsSync('./resource/swagger-ui')) {
            fs_1.default.mkdirSync('./resource/swagger-ui');
        }
        const files = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js'];
        files.forEach((f) => {
            fs_1.default.copyFileSync(swaggerUIPath + '/' + f, './resource/swagger-ui/' + f);
        });
        fs_1.default.copyFileSync(swaggerPluginPath + '/index.html', './resource/swagger-ui/index.html');
    }
}
exports.default = default_1;
const allTags = [];
const ApiGroupDoc = (name, description = '', order = 999999999) => {
    return function (target) {
        allTags.push({ controllerName: target.name, name, description, order });
    };
};
exports.ApiGroupDoc = ApiGroupDoc;
const allApis = [];
const ApiDoc = (api) => {
    api.order = api.order || 9999999;
    return function (target, propertyKey, descriptor) {
        allApis.push({ ...api, controllerName: target.constructor.name, callMethod: propertyKey });
    };
};
exports.ApiDoc = ApiDoc;
const findRoute = (controllerName, callMethod) => {
    for (const path in request_mapping_1.requestMapping) {
        for (const requestMethod in request_mapping_1.requestMapping[path]) {
            const route = request_mapping_1.requestMapping[path][requestMethod];
            if (route.controllerName === controllerName && route.callMethod === callMethod) {
                return { path, requestMethod, params: route.params };
            }
        }
    }
    return null;
};
const findTag = (controllerName) => {
    const tag = allTags.find((tag) => tag.controllerName === controllerName);
    if (tag) {
        return tag.name;
    }
    return '';
};
const parmMatchPattern = {
    '(ctx, paramName, name) => ctx.request.queries[name || paramName]': 'query',
    '(ctx, paramName, name) => ctx.request.pathParams[name || paramName]': 'path',
    '(ctx, paramName, name) => ctx.request.headers[name || paramName]': 'header',
    '(ctx) => ctx.request.body': 'body'
};
const getType = (type) => {
    if (!type) {
        return '';
    }
    const basicTypes = ['int', 'bigint', 'number', 'string', 'boolean'];
    if (basicTypes.includes(type.name.toLowerCase())) {
        return intToInteger(type.name.toLowerCase());
    }
    return 'object';
};
const intToInteger = (type) => {
    if (type === 'int' || type === 'bigint') {
        return 'integer';
    }
    if (type === 'float') {
        return 'number';
    }
    return type;
};
const getParamType = (func) => {
    for (const p in parmMatchPattern) {
        if (func.toString().indexOf(p) >= 0) {
            return parmMatchPattern[p];
        }
    }
    return null;
};
const getRequestTypeDesc = (t) => {
    if (getType(t) !== 'object') {
        return { type: getType(t), description: '' };
    }
    const typeInc = new t();
    const typeDesc = {};
    for (const key of Reflect.getOwnMetadataKeys(t.prototype)) {
        const declareType = Reflect.getMetadata('DeclareType', typeInc, key);
        const designType = Reflect.getMetadata('design:type', typeInc, key);
        if (designType.name.toLowerCase() === 'object') {
            typeDesc[key] = {
                type: 'object',
                description: '',
                properties: getRequestTypeDesc(declareType)
            };
        }
        else if (designType.name.toLowerCase() === 'array') {
            typeDesc[key] = {
                type: 'array',
                description: '',
                items: getRequestTypeDesc(declareType)
            };
        }
        else {
            // enum
            if (typeof declareType === 'object' && designType.name === 'String') {
                typeDesc[key] = {
                    type: 'string',
                    enum: Object.keys(declareType),
                    description: ''
                };
            }
            else {
                typeDesc[key] = {
                    type: intToInteger(declareType.name.toLowerCase()),
                    description: ''
                };
            }
        }
    }
    return { type: 'object', properties: typeDesc, description: '' };
};
let outSwaggerJson = null;
let SummerSwaggerUIController = class SummerSwaggerUIController {
    getSwaggerDocument() {
        if (outSwaggerJson) {
            return outSwaggerJson;
        }
        allTags.forEach((tag) => {
            swaggerJson.tags.push({ name: tag.name, description: tag.description });
        });
        allApis.forEach((api) => {
            const roteInfo = findRoute(api.controllerName, api.callMethod);
            if (roteInfo) {
                const { path, requestMethod, params } = roteInfo;
                let docPath = (path || '/').replace(/\/{2,}/g, '/');
                docPath = docPath.replace(/:([^/]+)/g, '{$1}');
                if (!swaggerJson.paths[docPath]) {
                    swaggerJson.paths[docPath] = {};
                }
                const parameters = [];
                params.forEach((param) => {
                    const paramType = getParamType(param.paramMethod.toString());
                    if (paramType) {
                        const ptype = getType(param.declareType);
                        parameters.push({
                            name: param.paramValues[0],
                            in: paramType,
                            description: '',
                            // required: true,
                            type: ptype,
                            schema: ptype === 'object'
                                ? {
                                    example: api.requestBody,
                                    required: [],
                                    ...getRequestTypeDesc(param.declareType)
                                }
                                : null
                        });
                    }
                });
                const errorResponse = {};
                for (const key in api.errorResponses) {
                    const resExample = api.errorResponses[key] || '';
                    errorResponse[key] = {
                        description: '',
                        schema: { type: typeof resExample === 'object' ? 'object' : 'string', properties: {}, example: resExample }
                    };
                }
                const successResExample = api.response || '';
                swaggerJson.paths[docPath][requestMethod.toLowerCase()] = {
                    tags: [findTag(api.controllerName)],
                    summary: api.summery,
                    description: api.description,
                    operationId: api.callMethod,
                    // consumes: ['application/json'],
                    // produces: ['application/json'],
                    parameters,
                    responses: {
                        200: {
                            description: '',
                            schema: {
                                type: typeof successResExample === 'object' ? 'object' : 'string',
                                properties: {},
                                example: successResExample
                            }
                        },
                        ...errorResponse
                    }
                };
            }
        });
        outSwaggerJson = swaggerJson;
        return swaggerJson;
    }
};
__decorate([
    (0, summer_1.Get)('/swagger-docs.json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SummerSwaggerUIController.prototype, "getSwaggerDocument", null);
SummerSwaggerUIController = __decorate([
    (0, summer_1.Controller)()
], SummerSwaggerUIController);
exports.SummerSwaggerUIController = SummerSwaggerUIController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBa0Y7QUFDbEYsd0VBQW9FO0FBQ3BFLHFEQUFvRDtBQUNwRCw0Q0FBb0I7QUF1RXBCLE1BQU0sV0FBVyxHQUFlO0lBQzlCLE9BQU8sRUFBRSxLQUFLO0lBQ2QsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtJQUNuQixJQUFJLEVBQUUsRUFBRTtJQUNSLFFBQVEsRUFBRSxFQUFFO0lBQ1osSUFBSSxFQUFFLEVBQUU7SUFDUixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDakIsS0FBSyxFQUFFLEVBQUU7Q0FDVixDQUFDO0FBRUY7SUFBQTtRQUNFLGNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztJQThDL0IsQ0FBQztJQTdDQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQXFCO1FBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUEsbUJBQVUsR0FBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25ELElBQUksWUFBWSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO2dCQUM3QixZQUFZLENBQUMsV0FBVyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO29CQUNuQyxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7aUJBQ3JDO2dCQUNELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRTtvQkFDeEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO2lCQUMx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
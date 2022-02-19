"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDoc = exports.ApiGroupDoc = void 0;
const summer_1 = require("@summer/summer");
const swagger_ui_dist_1 = require("swagger-ui-dist");
const fs_1 = __importDefault(require("fs"));
const swaggerJson = {
    swagger: '2.0',
    info: { title: '' },
    host: '',
    basePath: '',
    tags: [],
    schemes: ['https'],
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
    postCompile() {
        let swaggerUIPath = (0, swagger_ui_dist_1.getAbsoluteFSPath)();
        if (!swaggerUIPath) {
            swaggerUIPath = '../../node_modules/swagger-ui-dist';
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
        allApis.push({ api, controllerName: target.name, controllerMethod: propertyKey });
    };
};
exports.ApiDoc = ApiDoc;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwyQ0FBK0Q7QUFDL0QscURBQW9EO0FBQ3BELDRDQUFvQjtBQXFFcEIsTUFBTSxXQUFXLEdBQWU7SUFDOUIsT0FBTyxFQUFFLEtBQUs7SUFDZCxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFO0lBQ25CLElBQUksRUFBRSxFQUFFO0lBQ1IsUUFBUSxFQUFFLEVBQUU7SUFDWixJQUFJLEVBQUUsRUFBRTtJQUNSLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNsQixLQUFLLEVBQUUsRUFBRTtDQUNWLENBQUM7QUFFRjtJQUFBO1FBQ0UsY0FBUyxHQUFHLGdCQUFnQixDQUFDO0lBbUMvQixDQUFDO0lBbENDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBcUI7UUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkMsTUFBTSxZQUFZLEdBQUcsSUFBQSxtQkFBVSxHQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbkQsSUFBSSxZQUFZLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7Z0JBQzdCLFlBQVksQ0FBQyxXQUFXLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQzthQUMxRDtpQkFBTTtnQkFDTCxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7b0JBQ25DLFlBQVksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztpQkFDckM7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFO29CQUN4QyxZQUFZLENBQUMsV0FBVyxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7aUJBQzFDO2FBQ0Y7WUFDRCxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEdBQUcscUJBQXFCLENBQUM7U0FDL0U7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksYUFBYSxHQUFHLElBQUEsbUNBQWlCLEdBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2xCLGFBQWEsR0FBRyxvQ0FBb0MsQ0FBQztTQUN0RDtRQUNELElBQUksQ0FBQyxZQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2hDLFlBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDNUI7UUFDRCxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO1lBQzNDLFlBQUUsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQztTQUN2QztRQUNELE1BQU0sS0FBSyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztRQUM1RixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDbEIsWUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSx3QkFBd0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXBDRCw0QkFvQ0M7QUFFRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDWixNQUFNLFdBQVcsR0FBRyxDQUFDLElBQVksRUFBRSxjQUFzQixFQUFFLEVBQUUsS0FBSyxHQUFHLFNBQVMsRUFBRSxFQUFFO0lBQ3ZGLE9BQU8sVUFBVSxNQUFXO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBSlcsUUFBQSxXQUFXLGVBSXRCO0FBRUYsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ1osTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQVN0QixFQUFFLEVBQUU7SUFDSCxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDO0lBQ2pDLE9BQU8sVUFBVSxNQUFXLEVBQUUsV0FBbUIsRUFBRSxVQUE4QjtRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDcEYsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBZFcsUUFBQSxNQUFNLFVBY2pCIn0=
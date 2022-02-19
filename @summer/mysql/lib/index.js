"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const summer_1 = require("@summer/summer");
const typeorm_2 = require("typeorm");
const StringUtils_1 = require("typeorm/util/StringUtils");
class DBNamingStrategy extends typeorm_2.DefaultNamingStrategy {
    tableName(targetName, userSpecifiedName) {
        return userSpecifiedName ? userSpecifiedName : (0, StringUtils_1.snakeCase)(targetName);
    }
    columnName(propertyName, customName) {
        return customName ? customName : (0, StringUtils_1.snakeCase)(propertyName);
    }
}
class default_1 {
    constructor() {
        this.configKey = 'MYSQL_CONFIG';
        this.entityList = [];
        this.dbConnections = [];
    }
    compile(classDecorator, clazz) {
        if (classDecorator.getName() === 'Entity') {
            const filePath = classDecorator
                .getSourceFile()
                .getFilePath()
                .replace(path_1.default.resolve('.') + '/src', '.')
                .replace(/\.ts$/, '');
            if (!this.entityList[filePath]) {
                this.entityList[filePath] = [];
            }
            this.entityList[filePath].push(clazz.getName());
        }
    }
    getAutoImportContent() {
        const allEntities = [];
        let fileContent = '';
        for (const path in this.entityList) {
            allEntities.push(...this.entityList[path]);
            fileContent += 'import { ' + this.entityList[path].join(',') + " } from '" + path + "';\n";
        }
        fileContent += 'global["$$_ENTITIES"] = [' + allEntities.join(',') + '];';
        return fileContent;
    }
    async init(config) {
        await this.connect(config);
    }
    async connect(connectOptions) {
        if (connectOptions) {
            const connection = await (0, typeorm_1.createConnection)({
                type: 'mysql',
                port: 3306,
                namingStrategy: new DBNamingStrategy(),
                entities: global['$$_ENTITIES'],
                ...connectOptions
            });
            if (!connection.isConnected) {
                summer_1.Logger.error('Failed to connect to database');
            }
            else {
                !process.env.SUMMER_TESTING && summer_1.Logger.log('MySQL DB connected');
                this.dbConnections.push(connection);
            }
        }
        else {
            summer_1.Logger.warning('Missing MYSQL_CONFIG in config file');
        }
    }
    async destroy() {
        while (this.dbConnections.length) {
            const conn = this.dbConnections.pop();
            await conn.close();
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF3QjtBQUN4QixxQ0FBdUQ7QUFDdkQsMkNBQXNEO0FBQ3RELHFDQUFnRDtBQUNoRCwwREFBcUQ7QUFFckQsTUFBTSxnQkFBaUIsU0FBUSwrQkFBcUI7SUFDbEQsU0FBUyxDQUFDLFVBQWtCLEVBQUUsaUJBQXFDO1FBQ2pFLE9BQU8saUJBQWlCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFBLHVCQUFTLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNELFVBQVUsQ0FBQyxZQUFvQixFQUFFLFVBQVU7UUFDekMsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBQSx1QkFBUyxFQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDRjtBQVVEO0lBQUE7UUFDRSxjQUFTLEdBQUcsY0FBYyxDQUFDO1FBQzNCLGVBQVUsR0FBRyxFQUFFLENBQUM7UUFDaEIsa0JBQWEsR0FBaUIsRUFBRSxDQUFDO0lBeURuQyxDQUFDO0lBdkRDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSztRQUMzQixJQUFJLGNBQWMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxRQUFRLEVBQUU7WUFDekMsTUFBTSxRQUFRLEdBQUcsY0FBYztpQkFDNUIsYUFBYSxFQUFFO2lCQUNmLFdBQVcsRUFBRTtpQkFDYixPQUFPLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDO2lCQUN4QyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNoQztZQUNELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ2pEO0lBQ0gsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLFdBQVcsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7U0FDNUY7UUFDRCxXQUFXLElBQUksMkJBQTJCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDMUUsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUNmLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUEyQjtRQUN2QyxJQUFJLGNBQWMsRUFBRTtZQUNsQixNQUFNLFVBQVUsR0FBZSxNQUFNLElBQUEsMEJBQWdCLEVBQUM7Z0JBQ3BELElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxJQUFJO2dCQUNWLGNBQWMsRUFBRSxJQUFJLGdCQUFnQixFQUFFO2dCQUN0QyxRQUFRLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQztnQkFDL0IsR0FBRyxjQUFjO2FBQ2xCLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFO2dCQUMzQixlQUFNLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ0wsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxlQUFNLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3JDO1NBQ0Y7YUFBTTtZQUNMLGVBQU0sQ0FBQyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUN2RDtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTztRQUNYLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0QyxNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7Q0FDRjtBQTVERCw0QkE0REMifQ==
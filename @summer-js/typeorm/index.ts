import { Logger, SummerPlugin, addPlugin, pluginCollection } from '@summer-js/summer'
import { ClassDeclaration } from 'ts-morph'
import {
  DefaultNamingStrategy,
  DataSource,
  DataSourceOptions,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Entity,
  Column,
  Index,
  ManyToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'
import fs from 'fs'

export class DBNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }
  columnName(propertyName: string, customName): string {
    return customName ? customName : snakeCase(propertyName)
  }
}

export type TypeORMConfig = Record<string, DataSourceOptions>

const DataSources: Record<string, DataSource> = {}
export const getDataSource = (dataSourceName: string) => {
  if (!DataSources[dataSourceName]) {
    Logger.error('data source: ' + dataSourceName + ' not exists')
  }
  return DataSources[dataSourceName]
}

class TypeORMPlugin implements SummerPlugin {
  configKey = 'TYPEORM_CONFIG'

  compile(clazz: ClassDeclaration) {
    let isSummerTypeOrmDeclare = false
    let isEntity = false
    for (const classDecorator of clazz.getDecorators()) {
      if (classDecorator.getName() === 'Entity') {
        isEntity = true
        break
      }
    }

    if (isEntity) {
      const imports = clazz.getSourceFile().getImportDeclarations()
      imports.forEach((impt) => {
        if (impt.getModuleSpecifier().getText() === "'@summer-js/typeorm'") {
          isSummerTypeOrmDeclare = true
          if (!impt.getNamedImports().find((ni) => ni.getText() === '_TypeOrmColumn')) {
            impt.insertNamedImport(0, '_TypeOrmColumn')
          }
        }
      })
      clazz.addDecorator({ name: 'ClassCollect', arguments: ["'AllEntities'"] })
      clazz.getChildren()[0].replaceWithText(
        clazz
          .getChildren()[0]
          .getText()
          .replace(/\n[^\n]*@ClassCollect/g, ' @ClassCollect')
      )
    }

    const imps = clazz.getImplements()
    if (imps.length > 0 && imps[0].getText() === 'MigrationInterface') {
      clazz.addDecorator({ name: 'ClassCollect', arguments: ["'AllMigrations'"] })
      clazz.getChildren()[0].replaceWithText(
        clazz
          .getChildren()[0]
          .getText()
          .replace(/\n[^\n]*@ClassCollect/g, ' @ClassCollect')
      )
    }

    if (!isSummerTypeOrmDeclare) {
      return
    }

    clazz.getProperties().forEach((p) => {
      const comment = p
        .getLeadingCommentRanges()
        .map((c) => {
          return c
            .getText()
            .replace(/^\/\*/, '')
            .replace(/\*\/$/, '')
            .replace(/^\/\//, '')
            .split('\n')
            .map((l) => l.trim())
            .join('\\n')
            .trim()
        })
        .join('\\n')
        .replace(/"/g, '\\"')
      const commentDeclare = `,comment:"${comment}"`
      const declareType = p.getStructure().type as string

      let columnType: string = undefined
      let columnDBType = undefined
      let length = undefined
      let precision = undefined
      let scale = undefined
      let nullable = false
      let enumType = undefined

      if (p.hasQuestionToken()) {
        nullable = true
      }

      let defaultValue = undefined
      if (p.getStructure().initializer) {
        defaultValue = p.getStructure().initializer
      }

      columnDBType = declareType.toLowerCase().replace(/<.+>$/, '')
      if (
        ['Text', 'SmallText', 'LongText', 'BigInt', 'DateType', 'TinyText', 'Year', 'TimeStamp', 'Time'].includes(
          declareType
        )
      ) {
        columnType = 'String'
      } else if (['Int', 'MediumInt', 'SmallInt', 'TinyInt'].includes(declareType)) {
        columnType = 'Number'
      } else if (['Date', 'DateTime'].includes(declareType)) {
        columnType = 'Date'
      } else if (['Boolean'].includes(declareType)) {
        columnType = 'Boolean'
      } else if (declareType.startsWith('VarChar<') || declareType.startsWith('Char<')) {
        columnType = 'String'
        length = declareType.replace(/^[^<]+</, '').replace('>', '')
      } else if (
        declareType.startsWith('Float<') ||
        declareType.startsWith('Real<') ||
        declareType.startsWith('Double<') ||
        declareType.startsWith('Decimal<')
      ) {
        columnType = 'Number'
        const len = declareType.replace(/^[^<]+</, '').replace('>', '')
        precision = len.split(',')[0]
        scale = len.split(',')[1]
      } else if (declareType.startsWith('SimpleJson<') || declareType.startsWith('SimpleArray<')) {
        columnType = declareType.replace(/^[^<]+</, '').replace('>', '')
        columnDBType = declareType.startsWith('SimpleJson<') ? 'simple-json' : 'simple-array'
      } else if (declareType.startsWith('Enum<')) {
        columnType = declareType.replace(/^[^<]+</, '').replace('>', '')
        columnDBType = 'enum'
        enumType = columnType
      } else if (declareType === 'Set') {
        columnType = 'String'
      } else {
        return
      }

      const columnTypeStr = columnType.endsWith('[]')
        ? '[' + columnType.replace('[]', '') + ',Array]'
        : '[' + columnType + ']'
      const typeStr = `type:"${columnDBType}"`
      const newDecorators = [{ name: '_PropDeclareType', arguments: [`${columnTypeStr}`] }]
      const lengthStr = length ? `,length:${length}` : ''
      const precisionStr = precision ? `,precision:${precision}` : ''
      const scaleStr = scale ? `,scale:${scale}` : ''
      const nullableStr = nullable ? ',nullable:true' : ',nullable:false'
      const defaultStr = defaultValue ? `,default:${defaultValue}` : ''
      const enumTypeStr = enumType ? `,enum:${enumType}` : ''

      if (!p.getDecorators().find((d) => d.getName().indexOf('Column') >= 0 || d.getName() === 'PrimaryKey')) {
        newDecorators.push({
          name: '_TypeOrmColumn',
          arguments: [
            `{${typeStr}${enumTypeStr}${defaultStr}${nullableStr}${precisionStr}${scaleStr}${lengthStr}${commentDeclare}}`
          ]
        })
      }

      const primaryKey = p.getDecorators().find((d) => d.getName() === 'PrimaryKey')
      if (primaryKey) {
        if (primaryKey.getArguments().length === 0) {
          primaryKey.addArgument(`{}`)
        }
        primaryKey.addArgument(
          `{${typeStr}${enumTypeStr}${defaultStr}${nullableStr}${precisionStr}${scaleStr}${lengthStr}${commentDeclare}}`
        )
      }

      p.addDecorators(newDecorators)
      p.replaceWithText(
        p
          .getText()
          .replace(/(@_PropDeclareType[^\n]+)\n/g, '$1 ')
          .replace(/(@_TypeOrmColumn[^\n]+)\n/g, '$1 ')
      )
    })
  }

  async init(config) {
    await this.connect(config)
  }

  async connect(typeOrmOptions: TypeORMConfig) {
    const isSummerTesting = process.env.SUMMER_TESTING !== undefined

    if (typeOrmOptions) {
      for (const dataSourceName in typeOrmOptions) {
        const options = typeOrmOptions[dataSourceName]
        const dataSource = new DataSource({
          namingStrategy: new DBNamingStrategy(),
          entities: pluginCollection['AllEntities'],
          migrations: pluginCollection['AllMigrations'],
          ...options
        })

        try {
          await dataSource.initialize()
          DataSources[dataSourceName] = dataSource
          if (!isSummerTesting) {
            Logger.info('Data Source: ' + dataSourceName + ' connected')
          }
        } catch (e) {
          Logger.error('Failed to connect data source: ' + dataSourceName)
          Logger.error(e)
        }
      }
    }
  }

  async destroy() {
    for (const dataSourceName of Object.keys(DataSources)) {
      const ds = DataSources[dataSourceName]
      await ds.destroy()
      delete DataSources[dataSourceName]
    }
  }
}

addPlugin(TypeORMPlugin)
export default TypeORMPlugin

type BigInt = string
type Int = number
type MediumInt = number
type SmallInt = number
type TinyInt = number

type Char<L> = string
type VarChar<L> = string

type Text = string
type TinyText = string
type LongText = string
type SmallText = string
type Boolean = boolean
type Float<P, S> = number
type Double<P, S> = number
type Decimal<P, S> = number
type Real<P, S> = number

type Time = string
type DateTime = string
type Year = string
type TimeStamp = string

type SimpleJson<T = any> = T
type SimpleArray<T = any> = T
type Set = string[]
type Enum<T> = T

// export {
//   Text,
//   Int,
//   SmallInt,
//   MediumInt,
//   TinyInt,
//   BigInt,
//   VarChar,
//   Char,
//   SmallText,
//   Float,
//   Double,
//   Real,
//   Boolean,
//   Time,
//   DateTime,
//   Year,
//   TimeStamp,
//   LongText,
//   TinyText,
//   SimpleJson,
//   SimpleArray,
//   Set,
//   Enum,
//   Decimal
// }

const PrimaryKey = ((options: { autoIncrement?: boolean } = {}, config) => {
  if (options.autoIncrement) {
    return PrimaryGeneratedColumn(config)
  } else {
    return PrimaryColumn(config)
  }
}) as (options: { autoIncrement?: boolean }) => PropertyDecorator

const _TypeOrmColumn = Column
// export { PrimaryKey, Entity, _TypeOrmColumn, Index, ManyToMany, JoinColumn, ManyToOne }

/*

bit, int, integer, tinyint, smallint, mediumint, bigint, float, double, double precision, dec, decimal, numeric, fixed, bool, boolean, date, datetime, timestamp, time, year, char, nchar, national char, varchar, nvarchar, national varchar, text, tinytext, mediumtext, blob, longtext, tinyblob, mediumblob, longblob, enum, set, json, binary, varbinary, geometry, point, linestring, polygon, multipoint, multilinestring, multipolygon, geometrycollection

*/

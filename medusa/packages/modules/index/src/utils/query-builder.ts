import { IndexTypes } from "@medusajs/framework/types"
import {
  GraphQLUtils,
  isDefined,
  isObject,
  isPresent,
  isString,
  unflattenObjectKeys,
} from "@medusajs/framework/utils"
import { Knex } from "@mikro-orm/knex"
import { OrderBy, QueryFormat, QueryOptions, Select } from "@types"

export const OPERATOR_MAP = {
  $eq: "=",
  $lt: "<",
  $gt: ">",
  $lte: "<=",
  $gte: ">=",
  $ne: "!=",
  $in: "IN",
  $is: "IS",
  $like: "LIKE",
  $ilike: "ILIKE",
}

export class QueryBuilder {
  #searchVectorColumnName = "document_tsv"

  private readonly structure: Select
  private readonly entityMap: Record<string, any>
  private readonly knex: Knex
  private readonly selector: QueryFormat
  private readonly options?: QueryOptions
  private readonly schema: IndexTypes.SchemaObjectRepresentation
  private readonly allSchemaFields: Set<string>
  private readonly rawConfig?: IndexTypes.IndexQueryConfig<any>
  private readonly requestedFields: {
    [key: string]: any
  }

  constructor(args: {
    schema: IndexTypes.SchemaObjectRepresentation
    entityMap: Record<string, any>
    knex: Knex
    selector: QueryFormat
    options?: QueryOptions
    rawConfig?: IndexTypes.IndexQueryConfig<any>
    requestedFields: {
      [key: string]: any
    }
  }) {
    this.schema = args.schema
    this.entityMap = args.entityMap
    this.selector = args.selector
    this.options = args.options
    this.knex = args.knex
    this.structure = this.selector.select
    this.allSchemaFields = new Set(
      Object.values(this.schema).flatMap((entity) => entity.fields ?? [])
    )
    this.rawConfig = args.rawConfig
    this.requestedFields = args.requestedFields
  }

  private getStructureKeys(structure) {
    return Object.keys(structure ?? {}).filter((key) => key !== "entity")
  }

  private getEntity(
    path,
    throwWhenNotFound = true
  ): IndexTypes.SchemaPropertiesMap[0] | undefined {
    if (!this.schema._schemaPropertiesMap[path]) {
      if (!throwWhenNotFound) {
        return
      }

      throw new Error(
        `Could not find entity for path: ${path}. It might not be indexed.`
      )
    }

    return this.schema._schemaPropertiesMap[path]
  }

  private getGraphQLType(path, field) {
    const entity = this.getEntity(path)?.ref?.entity!
    const fieldRef = this.entityMap[entity]._fields[field]

    if (!fieldRef) {
      throw new Error(`Field ${field} is not indexed.`)
    }

    let currentType = fieldRef.type
    let isArray = false
    while (currentType.ofType) {
      if (currentType instanceof GraphQLUtils.GraphQLList) {
        isArray = true
      }

      currentType = currentType.ofType
    }

    return currentType.name + (isArray ? "[]" : "")
  }

  private transformValueToType(path, field, value) {
    if (value === null) {
      return null
    }

    const typeToFn = {
      Int: (val) => parseInt(val, 10),
      Float: (val) => parseFloat(val),
      String: (val) => String(val),
      Boolean: (val) => Boolean(val),
      ID: (val) => String(val),
      Date: (val) => new Date(val).toISOString(),
      DateTime: (val) => new Date(val).toISOString(),
      Time: (val) => new Date(`1970-01-01T${val}Z`).toISOString(),
    }

    const fullPath = [path, ...field]
    const prop = fullPath.pop()
    const fieldPath = fullPath.join(".")
    const graphqlType = this.getGraphQLType(fieldPath, prop).replace("[]", "")

    const fn = typeToFn[graphqlType]
    if (Array.isArray(value)) {
      return value.map((v) => (!fn ? v : fn(v)))
    }
    return !fn ? value : fn(value)
  }

  private getPostgresCastType(path, field) {
    const graphqlToPostgresTypeMap = {
      Int: "::int",
      Float: "::double precision",
      Boolean: "::boolean",
      Date: "::timestamp",
      DateTime: "::timestamp",
      Time: "::time",
      "": "",
    }

    const defaultValues = {
      Int: "0",
      Float: "0",
      Boolean: "false",
      Date: "1970-01-01 00:00:00",
      DateTime: "1970-01-01 00:00:00",
      Time: "00:00:00",
      "": "",
    }

    const fullPath = [path, ...field]
    const prop = fullPath.pop()
    const fieldPath = fullPath.join(".")
    let graphqlType = this.getGraphQLType(fieldPath, prop)
    const isList = graphqlType.endsWith("[]")
    graphqlType = graphqlType.replace("[]", "")

    const cast =
      (graphqlToPostgresTypeMap[graphqlType] ?? "") + (isList ? "[]" : "")

    function generateCoalesceExpression(field) {
      const defaultValue = defaultValues[graphqlType]
      return `COALESCE(${field}, '${defaultValue}')${cast}`
    }

    return {
      cast,
      coalesce: generateCoalesceExpression,
    }
  }

  private parseWhere(
    aliasMapping: { [path: string]: string },
    obj: object,
    builder: Knex.QueryBuilder
  ) {
    const keys = Object.keys(obj)

    const getPathAndField = (key: string) => {
      const path = key.split(".")
      const field = [path.pop()]

      while (!aliasMapping[path.join(".")] && path.length > 0) {
        field.unshift(path.pop())
      }

      const attr = path.join(".")

      return { field, attr }
    }

    const getPathOperation = (
      attr: string,
      path: string[],
      value: unknown
    ): string => {
      const partialPath = path.length > 1 ? path.slice(0, -1) : path
      const val = this.transformValueToType(attr, partialPath, value)
      const result = path.reduceRight((acc, key) => {
        return { [key]: acc }
      }, val)

      return JSON.stringify(result)
    }

    keys.forEach((key) => {
      let value = obj[key]

      if ((key === "$and" || key === "$or") && !Array.isArray(value)) {
        value = [value]
      }

      if (key === "$and" && Array.isArray(value)) {
        builder.where((qb) => {
          value.forEach((cond) => {
            qb.andWhere((subBuilder) =>
              this.parseWhere(aliasMapping, cond, subBuilder)
            )
          })
        })
      } else if (key === "$or" && Array.isArray(value)) {
        builder.where((qb) => {
          value.forEach((cond) => {
            qb.orWhere((subBuilder) =>
              this.parseWhere(aliasMapping, cond, subBuilder)
            )
          })
        })
      } else if (isObject(value) && !Array.isArray(value)) {
        const subKeys = Object.keys(value)
        subKeys.forEach((subKey) => {
          let operator = OPERATOR_MAP[subKey]
          if (operator) {
            const { field, attr } = getPathAndField(key)
            const nested = new Array(field.length).join("->?")

            const subValue = this.transformValueToType(
              attr,
              field,
              value[subKey]
            )
            const castType = this.getPostgresCastType(attr, [field]).cast

            const val = operator === "IN" ? subValue : [subValue]
            if (operator === "=" && subValue === null) {
              operator = "IS"
            } else if (operator === "!=" && subValue === null) {
              operator = "IS NOT"
            }

            if (operator === "=") {
              builder.whereRaw(
                `${aliasMapping[attr]}.data @> '${getPathOperation(
                  attr,
                  field as string[],
                  subValue
                )}'::jsonb`
              )
            } else {
              builder.whereRaw(
                `(${aliasMapping[attr]}.data${nested}->>?)${castType} ${operator} ?`,
                [...field, ...val]
              )
            }
          } else {
            throw new Error(`Unsupported operator: ${subKey}`)
          }
        })
      } else {
        const { field, attr } = getPathAndField(key)
        const nested = new Array(field.length).join("->?")

        value = this.transformValueToType(attr, field, value)
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return
          }

          const castType = this.getPostgresCastType(attr, field).cast
          const inPlaceholders = value.map(() => "?").join(",")
          builder.whereRaw(
            `(${aliasMapping[attr]}.data${nested}->>?)${castType} IN (${inPlaceholders})`,
            [...field, ...value]
          )
        } else if (isDefined(value)) {
          const operator = value === null ? "IS" : "="

          if (operator === "=") {
            builder.whereRaw(
              `${aliasMapping[attr]}.data @> '${getPathOperation(
                attr,
                field as string[],
                value
              )}'::jsonb`
            )
          } else {
            const castType = this.getPostgresCastType(attr, field).cast
            builder.whereRaw(
              `(${aliasMapping[attr]}.data${nested}->>?)${castType} ${operator} ?`,
              [...field, value]
            )
          }
        }
      }
    })

    return builder
  }

  private getShortAlias(aliasMapping, alias: string) {
    aliasMapping.__aliasIndex ??= 0

    if (aliasMapping[alias]) {
      return aliasMapping[alias]
    }

    aliasMapping[alias] = "t_" + aliasMapping.__aliasIndex++ + "_"

    return aliasMapping[alias]
  }

  private buildQueryParts(
    structure: Select,
    parentAlias: string,
    parentEntity: string,
    parentProperty: string,
    aliasPath: string[] = [],
    level = 0,
    aliasMapping: { [path: string]: string } = {}
  ): string[] {
    const currentAliasPath = [...aliasPath, parentProperty].join(".")

    const isSelectableField = this.allSchemaFields.has(parentProperty)
    const entities = this.getEntity(currentAliasPath, false)
    const entityRef = entities?.ref!

    // !entityRef.alias means the object has not table, it's a nested object
    if (isSelectableField || !entities || !entityRef?.alias) {
      // We are currently selecting a specific field of the parent entity or the entity is not found on the index schema
      // We don't need to build the query parts for this as there is no join
      return []
    }

    const mainEntity = entityRef.entity
    const mainAlias =
      this.getShortAlias(aliasMapping, mainEntity.toLowerCase()) + level

    const allEntities: any[] = []
    if (!entities.shortCutOf) {
      allEntities.push({
        entity: mainEntity,
        parEntity: parentEntity,
        parAlias: parentAlias,
        alias: mainAlias,
      })
    } else {
      const intermediateAlias = entities.shortCutOf.split(".")

      for (let i = intermediateAlias.length - 1, x = 0; i >= 0; i--, x++) {
        const intermediateEntity = this.getEntity(
          intermediateAlias.join("."),
          false
        )
        if (!intermediateEntity) {
          break
        }

        intermediateAlias.pop()

        if (intermediateEntity.ref.entity === parentEntity) {
          break
        }

        const parentIntermediateEntity = this.getEntity(
          intermediateAlias.join(".")
        )!

        const alias =
          this.getShortAlias(
            aliasMapping,
            intermediateEntity.ref.entity.toLowerCase()
          ) +
          level +
          "_" +
          x

        const parAlias =
          parentIntermediateEntity.ref.entity === parentEntity
            ? parentAlias
            : this.getShortAlias(
                aliasMapping,
                parentIntermediateEntity.ref.entity.toLowerCase()
              ) +
              level +
              "_" +
              (x + 1)

        if (x === 0) {
          aliasMapping[currentAliasPath] = alias
        }

        allEntities.unshift({
          entity: intermediateEntity.ref.entity,
          parEntity: parentIntermediateEntity.ref.entity,
          parAlias,
          alias,
        })
      }
    }

    let queryParts: string[] = []
    for (const join of allEntities) {
      const joinBuilder = this.knex.queryBuilder()
      const { alias, entity, parEntity, parAlias } = join

      aliasMapping[currentAliasPath] = alias

      if (level > 0) {
        const cName = entity.toLowerCase()
        const pName = `${parEntity}${entity}`.toLowerCase()

        let joinTable = `cat_${cName} AS ${alias}`

        const pivotTable = `cat_pivot_${pName}`
        joinBuilder.leftJoin(
          `${pivotTable} AS ${alias}_ref`,
          `${alias}_ref.parent_id`,
          `${parAlias}.id`
        )
        joinBuilder.leftJoin(joinTable, `${alias}.id`, `${alias}_ref.child_id`)

        const joinWhere = this.selector.joinWhere ?? {}
        const joinKey = Object.keys(joinWhere).find((key) => {
          const k = key.split(".")
          k.pop()
          const curPath = k.join(".")
          if (curPath === currentAliasPath) {
            const relEntity = this.getEntity(curPath, false)
            return relEntity?.ref?.entity === entity
          }

          return false
        })

        if (joinKey) {
          this.parseWhere(
            aliasMapping,
            { [joinKey]: joinWhere[joinKey] },
            joinBuilder
          )
        }

        queryParts.push(
          joinBuilder.toQuery().replace("select * ", "").replace("where", "and")
        )
      }
    }

    const children = this.getStructureKeys(structure)
    for (const child of children) {
      const childStructure = structure[child] as Select
      queryParts = queryParts
        .concat(
          this.buildQueryParts(
            childStructure,
            mainAlias,
            mainEntity,
            child,
            aliasPath.concat(parentProperty),
            level + 1,
            aliasMapping
          )
        )
        .filter(Boolean)
    }

    return queryParts
  }

  private buildSelectParts(
    structure: Select,
    parentProperty: string,
    aliasMapping: { [path: string]: string },
    aliasPath: string[] = [],
    selectParts: object = {}
  ): object {
    const currentAliasPath = [...aliasPath, parentProperty].join(".")

    const isSelectableField = this.allSchemaFields.has(parentProperty)
    if (isSelectableField) {
      // We are currently selecting a specific field of the parent entity
      // Let's remove the parent alias from the select parts to not select everything entirely
      // and add the specific field to the select parts
      const parentAliasPath = aliasPath.join(".")
      const alias = aliasMapping[parentAliasPath]
      delete selectParts[parentAliasPath]
      selectParts[currentAliasPath] = this.knex.raw(
        `${alias}.data->'${parentProperty}'`
      )
      return selectParts
    }

    const alias = aliasMapping[currentAliasPath]
    // If the entity is not found in the schema (not indexed), we don't need to build the select parts
    if (!alias) {
      return selectParts
    }

    selectParts[currentAliasPath] = `${alias}.data`
    selectParts[currentAliasPath + ".id"] = `${alias}.id`

    const children = this.getStructureKeys(structure)

    for (const child of children) {
      const childStructure = structure[child] as Select

      this.buildSelectParts(
        childStructure,
        child,
        aliasMapping,
        aliasPath.concat(parentProperty),
        selectParts
      )
    }

    return selectParts
  }

  private transformOrderBy(arr: (object | string)[]): OrderBy {
    const result = {}
    const map = new Map()
    map.set(true, "ASC")
    map.set(1, "ASC")
    map.set("ASC", "ASC")
    map.set(false, "DESC")
    map.set(-1, "DESC")
    map.set("DESC", "DESC")

    function nested(obj, prefix = "") {
      const keys = Object.keys(obj)
      if (!keys.length) {
        return
      } else if (keys.length > 1) {
        throw new Error("Order by only supports one key per object.")
      }
      const key = keys[0]
      let value = obj[key]
      if (isObject(value)) {
        nested(value, prefix + key + ".")
      } else {
        if (isString(value)) {
          value = value.toUpperCase()
        }
        result[prefix + key] = map.get(value) ?? "ASC"
      }
    }
    arr.forEach((obj) => nested(obj))

    return result
  }

  public buildQuery({
    hasPagination = true,
    hasCount = false,
    returnIdOnly = false,
  }: {
    hasPagination?: boolean
    hasCount?: boolean
    returnIdOnly?: boolean
  }): string {
    const queryBuilder = this.knex.queryBuilder()

    const selectOnlyStructure = this.selector.select
    const structure = this.requestedFields
    const filter = this.selector.where ?? {}

    const { orderBy: order, skip, take } = this.options ?? {}

    const orderBy = this.transformOrderBy(
      (order && !Array.isArray(order) ? [order] : order) ?? []
    )

    const rootKey = this.getStructureKeys(structure)[0]
    const rootStructure = structure[rootKey] as Select

    const entity = this.getEntity(rootKey)!.ref.entity
    const rootEntity = entity.toLowerCase()
    const aliasMapping: { [path: string]: string } = {}

    let hasTextSearch: boolean = false
    let textSearchQuery: string | null = null
    const searchQueryFilterProp = `${rootEntity}.q`

    if (searchQueryFilterProp in filter) {
      if (!filter[searchQueryFilterProp]) {
        delete filter[searchQueryFilterProp]
      } else {
        hasTextSearch = true
        textSearchQuery = filter[searchQueryFilterProp]
        delete filter[searchQueryFilterProp]
      }
    }

    const joinParts = this.buildQueryParts(
      rootStructure,
      "",
      entity,
      rootKey,
      [],
      0,
      aliasMapping
    )

    const rootAlias = aliasMapping[rootKey]
    const selectParts = !returnIdOnly
      ? this.buildSelectParts(
          selectOnlyStructure[rootKey] as Select,
          rootKey,
          aliasMapping
        )
      : { [rootKey + ".id"]: `${rootAlias}.id` }

    queryBuilder.select(selectParts)

    queryBuilder.from(
      `cat_${rootEntity} AS ${this.getShortAlias(aliasMapping, rootEntity)}`
    )

    joinParts.forEach((joinPart) => {
      queryBuilder.joinRaw(joinPart)
    })

    let searchWhereParts: string[] = []
    if (hasTextSearch) {
      /**
       * Build the search where parts for the query,.
       * Apply the search query to the search vector column for every joined tabled except
       * the pivot joined table.
       */
      searchWhereParts = [
        `${this.getShortAlias(aliasMapping, rootEntity)}.${
          this.#searchVectorColumnName
        } @@ plainto_tsquery('simple', '${textSearchQuery}')`,
        ...joinParts.flatMap((part) => {
          const aliases = part
            .split(" as ")
            .flatMap((chunk) => chunk.split(" on "))
            .filter(
              (alias) => alias.startsWith('"t_') && !alias.includes("_ref")
            )
          return aliases.map(
            (alias) =>
              `${alias}.${
                this.#searchVectorColumnName
              } @@ plainto_tsquery('simple', '${textSearchQuery}')`
          )
        }),
      ]

      queryBuilder.whereRaw(`(${searchWhereParts.join(" OR ")})`)
    }

    // WHERE clause
    this.parseWhere(aliasMapping, filter, queryBuilder)

    // ORDER BY clause
    for (const aliasPath in orderBy) {
      const path = aliasPath.split(".")
      const field = path.pop()
      const attr = path.join(".")

      const pgType = this.getPostgresCastType(attr, [field])
      const alias = aliasMapping[attr]
      const direction = orderBy[aliasPath]

      queryBuilder.orderByRaw(
        `(${alias}.data->>'${field}')${pgType.cast}` + " " + direction
      )
    }

    let take_ = !isNaN(+take!) ? +take! : 15
    let skip_ = !isNaN(+skip!) ? +skip! : 0

    let cte = ""
    if (hasPagination) {
      cte = this.buildCTEData({
        hasCount,
        searchWhereParts,
        take: take_,
        skip: skip_,
        orderBy,
      })

      if (hasCount) {
        queryBuilder.select(this.knex.raw("pd.count_total"))
      }

      queryBuilder.joinRaw(
        `JOIN paginated_data AS pd ON ${rootAlias}.id = pd.id`
      )
    }

    return cte + queryBuilder.toQuery()
  }

  public buildCTEData({
    hasCount,
    searchWhereParts = [],
    skip,
    take,
    orderBy,
  }: {
    hasCount: boolean
    searchWhereParts: string[]
    skip?: number
    take: number
    orderBy: OrderBy
  }): string {
    const queryBuilder = this.knex.queryBuilder()

    const hasWhere = isPresent(this.rawConfig?.filters) || isPresent(orderBy)
    const structure =
      hasWhere && !searchWhereParts.length
        ? unflattenObjectKeys({
            ...(this.rawConfig?.filters
              ? unflattenObjectKeys(this.rawConfig?.filters)
              : {}),
            ...orderBy,
          })
        : this.requestedFields

    const rootKey = this.getStructureKeys(structure)[0]

    const rootStructure = structure[rootKey] as Select

    const entity = this.getEntity(rootKey)!.ref.entity
    const rootEntity = entity.toLowerCase()
    const aliasMapping: { [path: string]: string } = {}

    const joinParts = this.buildQueryParts(
      rootStructure,
      "",
      entity,
      rootKey,
      [],
      0,
      aliasMapping
    )

    const rootAlias = aliasMapping[rootKey]

    queryBuilder.select(this.knex.raw(`${rootAlias}.id as id`))

    queryBuilder.from(
      `cat_${rootEntity} AS ${this.getShortAlias(aliasMapping, rootEntity)}`
    )

    if (hasWhere) {
      joinParts.forEach((joinPart) => {
        queryBuilder.joinRaw(joinPart)
      })

      if (searchWhereParts.length) {
        queryBuilder.whereRaw(`(${searchWhereParts.join(" OR ")})`)
      }

      this.parseWhere(aliasMapping, this.selector.where!, queryBuilder)
    }

    // ORDER BY clause
    const orderAliases: string[] = []
    for (const aliasPath in orderBy) {
      const path = aliasPath.split(".")
      const field = path.pop()
      const attr = path.join(".")

      const pgType = this.getPostgresCastType(attr, [field])

      const alias = aliasMapping[attr]
      const direction = orderBy[aliasPath]

      const orderAlias = `"${alias}.data->>'${field}'"`
      orderAliases.push(orderAlias + " " + direction)

      // transform the order by clause to a select MIN/MAX
      queryBuilder.select(
        direction === "ASC"
          ? this.knex.raw(
              `MIN((${alias}.data->>'${field}')${pgType.cast}) as ${orderAlias}`
            )
          : this.knex.raw(
              `MAX((${alias}.data->>'${field}')${pgType.cast}) as ${orderAlias}`
            )
      )
    }

    queryBuilder.groupByRaw(`${rootAlias}.id`)

    const countSubQuery = hasCount
      ? `, (SELECT count(id) FROM data_select) as count_total`
      : ""

    return `
      WITH data_select AS (
        ${queryBuilder.toQuery()}
      ),
      paginated_data AS (
        SELECT id ${countSubQuery}
        FROM data_select
        ${orderAliases.length ? "ORDER BY " + orderAliases.join(", ") : ""}
        LIMIT ${take}
        ${skip ? `OFFSET ${skip}` : ""}
      )
    `
  }

  // NOTE: We are keeping the bellow code for now as reference to alternative implementation for us. DO NOT REMOVE
  // public buildQueryCount(): string {
  //   const queryBuilder = this.knex.queryBuilder()

  //   const hasWhere = isPresent(this.rawConfig?.filters)
  //   const structure = hasWhere ? this.rawConfig?.filters! : this.structure

  //   const rootKey = this.getStructureKeys(structure)[0]

  //   const rootStructure = structure[rootKey] as Select

  //   const entity = this.getEntity(rootKey)!.ref.entity
  //   const rootEntity = entity.toLowerCase()
  //   const aliasMapping: { [path: string]: string } = {}

  //   const joinParts = this.buildQueryParts(
  //     rootStructure,
  //     "",
  //     entity,
  //     rootKey,
  //     [],
  //     0,
  //     aliasMapping
  //   )

  //   const rootAlias = aliasMapping[rootKey]

  //   queryBuilder.select(this.knex.raw(`COUNT(${rootAlias}.id) as count`))

  //   queryBuilder.from(
  //     `cat_${rootEntity} AS ${this.getShortAlias(aliasMapping, rootEntity)}`
  //   )

  //   const self = this
  //   if (hasWhere && joinParts.length) {
  //     const fromExistsRaw = joinParts.shift()!
  //     const [joinPartsExists, fromExistsPart] =
  //       fromExistsRaw.split(" left join ")
  //     const [fromExists, whereExists] = fromExistsPart.split(" on ")
  //     joinParts.unshift(joinPartsExists)

  //     queryBuilder.whereExists(function () {
  //       this.select(self.knex.raw(`1`))
  //       this.from(self.knex.raw(`${fromExists}`))
  //       this.joinRaw(joinParts.join("\n"))
  //       if (hasWhere) {
  //         self.parseWhere(aliasMapping, self.selector.where!, this)
  //         this.whereRaw(self.knex.raw(whereExists))
  //         return
  //       }

  //       this.whereRaw(self.knex.raw(whereExists))
  //     })
  //   } else {
  //     queryBuilder.whereExists(function () {
  //       this.select(self.knex.raw(`1`))
  //       if (hasWhere) {
  //         self.parseWhere(aliasMapping, self.selector.where!, this)
  //       }
  //     })
  //   }

  //   return queryBuilder.toQuery()
  // }

  public buildObjectFromResultset(
    resultSet: Record<string, any>[]
  ): Record<string, any>[] {
    const structure = this.structure
    const rootKey = this.getStructureKeys(structure)[0]

    const maps: { [key: string]: { [id: string]: Record<string, any> } } = {}
    const isListMap: { [path: string]: boolean } = {}
    const referenceMap: { [key: string]: any } = {}
    const pathDetails: {
      [key: string]: { property: string; parents: string[]; parentPath: string }
    } = {}

    const initializeMaps = (structure: Select, path: string[]) => {
      const currentPath = path.join(".")
      const entity = this.getEntity(currentPath, false)
      if (!entity) {
        return
      }

      maps[currentPath] = {}

      if (path.length > 1) {
        const property = path[path.length - 1]
        const parents = path.slice(0, -1)
        const parentPath = parents.join(".")

        // In the case of specific selection
        // We dont need to check if the property is a list
        const isSelectableField = this.allSchemaFields.has(property)
        if (isSelectableField) {
          pathDetails[currentPath] = { property, parents, parentPath }
          isListMap[currentPath] = false
          return
        }

        isListMap[currentPath] = !!this.getEntity(
          currentPath,
          false
        )?.ref?.parents?.find((p) => p.targetProp === property)?.isList

        pathDetails[currentPath] = { property, parents, parentPath }
      }

      const children = this.getStructureKeys(structure)
      for (const key of children) {
        initializeMaps(structure[key] as Select, [...path, key])
      }
    }
    initializeMaps(structure[rootKey] as Select, [rootKey])

    function buildReferenceKey(
      path: string[],
      id: string,
      row: Record<string, any>
    ) {
      let current = ""
      let key = ""
      for (const p of path) {
        current += `${p}`
        key += row[`${current}.id`] + "."
        current += "."
      }
      return key + id
    }

    const columnMap = {}
    const columnNames = Object.keys(resultSet[0] ?? {})
    for (const property of columnNames) {
      const segments = property.split(".")
      const field = segments.pop()
      const parent = segments.join(".")

      columnMap[parent] ??= []
      columnMap[parent].push({
        field,
        property,
      })
    }

    resultSet.forEach((row) => {
      for (const path in maps) {
        const id = row[`${path}.id`]

        // root level
        if (!pathDetails[path]) {
          if (!maps[path][id]) {
            maps[path][id] = row[path] || undefined

            // If there is an id, but no object values, it means that specific fields were selected
            // so we recompose the object with all selected fields. (id will always be selected)
            if (!maps[path][id] && id) {
              maps[path][id] = {}
              for (const column of columnMap[path]) {
                maps[path][id][column.field] = row[column.property]
              }
            }
          }
          continue
        }

        const { property, parents, parentPath } = pathDetails[path]
        const referenceKey = buildReferenceKey(parents, id, row)

        if (referenceMap[referenceKey]) {
          continue
        }

        maps[path][id] = row[path] || undefined

        // If there is an id, but no object values, it means that specific fields were selected
        // so we recompose the object with all selected fields. (id will always be selected)
        if (!maps[path][id] && id) {
          maps[path][id] = {}
          for (const column of columnMap[path]) {
            maps[path][id][column.field] = row[column.property]
          }
        }

        const parentObj = maps[parentPath][row[`${parentPath}.id`]]

        if (!parentObj) {
          continue
        }

        const isList = isListMap[parentPath + "." + property]
        if (isList && !Array.isArray(parentObj[property])) {
          parentObj[property] = []
        }

        if (maps[path][id] !== undefined) {
          if (isList) {
            parentObj[property].push(maps[path][id])
          } else {
            parentObj[property] = maps[path][id]
          }
        }

        referenceMap[referenceKey] = true
      }
    })

    return Object.values(maps[rootKey] ?? {})
  }
}

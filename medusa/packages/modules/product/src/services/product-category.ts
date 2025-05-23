import {
  Context,
  DAL,
  FindConfig,
  InferEntityType,
  ProductTypes,
} from "@medusajs/framework/types"
import {
  FreeTextSearchFilterKeyPrefix,
  InjectManager,
  InjectTransactionManager,
  isDefined,
  MedusaContext,
  MedusaError,
  ModulesSdkUtils,
} from "@medusajs/framework/utils"
import { ProductCategory } from "@models"
import { ProductCategoryRepository } from "@repositories"
import { UpdateCategoryInput } from "@types"

type InjectedDependencies = {
  productCategoryRepository: DAL.TreeRepositoryService
}
export default class ProductCategoryService {
  protected readonly productCategoryRepository_: DAL.TreeRepositoryService

  constructor({ productCategoryRepository }: InjectedDependencies) {
    this.productCategoryRepository_ = productCategoryRepository
  }

  // TODO: Add support for object filter
  @InjectManager("productCategoryRepository_")
  async retrieve(
    productCategoryId: string,
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCategory>> {
    if (!isDefined(productCategoryId)) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `"productCategoryId" must be defined`
      )
    }

    const queryOptions = ModulesSdkUtils.buildQuery(
      {
        id: productCategoryId,
      },
      config
    )

    // TODO: Currently remoteQuery doesn't allow passing custom objects, so the `include*` are part of the filters
    // Modify remoteQuery to allow passing custom objects
    const transformOptions = {
      includeDescendantsTree: true,
    }

    const productCategories = await this.productCategoryRepository_.find(
      queryOptions,
      transformOptions,
      sharedContext
    )

    if (!productCategories?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `ProductCategory with id: ${productCategoryId} was not found`
      )
    }

    return productCategories[0]
  }

  @InjectManager("productCategoryRepository_")
  async list(
    filters: ProductTypes.FilterableProductCategoryProps = {},
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCategory>[]> {
    const transformOptions = {
      includeDescendantsTree: filters?.include_descendants_tree || false,
      includeAncestorsTree: filters?.include_ancestors_tree || false,
    }
    delete filters.include_descendants_tree
    delete filters.include_ancestors_tree

    // Apply free text search filter
    if (isDefined(filters?.q)) {
      config.filters ??= {}
      config.filters[FreeTextSearchFilterKeyPrefix + ProductCategory.name] = {
        value: filters.q,
        fromEntity: ProductCategory.name,
      }

      delete filters.q
    }

    const queryOptions = ModulesSdkUtils.buildQuery(filters, config)
    queryOptions.where ??= {}

    return await this.productCategoryRepository_.find(
      queryOptions,
      transformOptions,
      sharedContext
    )
  }

  @InjectManager("productCategoryRepository_")
  async listAndCount(
    filters: ProductTypes.FilterableProductCategoryProps = {},
    config: FindConfig<ProductTypes.ProductCategoryDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[InferEntityType<typeof ProductCategory>[], number]> {
    const transformOptions = {
      includeDescendantsTree: filters?.include_descendants_tree || false,
      includeAncestorsTree: filters?.include_ancestors_tree || false,
    }
    delete filters.include_descendants_tree
    delete filters.include_ancestors_tree

    // Apply free text search filter
    if (isDefined(filters?.q)) {
      config.filters ??= {}
      config.filters[FreeTextSearchFilterKeyPrefix + ProductCategory.name] = {
        value: filters.q,
        fromEntity: ProductCategory.name,
      }

      delete filters.q
    }

    const queryOptions = ModulesSdkUtils.buildQuery(filters, config)
    queryOptions.where ??= {}

    return await this.productCategoryRepository_.findAndCount(
      queryOptions,
      transformOptions,
      sharedContext
    )
  }

  @InjectTransactionManager("productCategoryRepository_")
  async create(
    data: ProductTypes.CreateProductCategoryDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCategory>[]> {
    return await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).create(data, sharedContext)
  }

  @InjectTransactionManager("productCategoryRepository_")
  async update(
    data: UpdateCategoryInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCategory>[]> {
    return await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).update(data, sharedContext)
  }

  @InjectTransactionManager("productCategoryRepository_")
  async delete(
    ids: string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<string[]> {
    return await this.productCategoryRepository_.delete(ids, sharedContext)
  }

  @InjectTransactionManager("productCategoryRepository_")
  async softDelete(
    ids: string[],
    @MedusaContext() sharedContext?: Context
  ): Promise<Record<string, string[]> | void> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).softDelete(ids, sharedContext)) as any
  }

  @InjectTransactionManager("productCategoryRepository_")
  async restore(
    ids: string[],
    @MedusaContext() sharedContext?: Context
  ): Promise<Record<string, string[]> | void> {
    return (await (
      this.productCategoryRepository_ as unknown as ProductCategoryRepository
    ).restore(ids, sharedContext)) as any
  }
}

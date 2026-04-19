import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import {
  IProduct,
  IProductCategory,
  IProductImage,
} from '@domain/interfaces/product.interface';
import {
  IProductRepository,
  PaginatedProducts,
  ProductFilters,
} from '@domain/repositories/src/product.repository';

const INCLUDE_LIST = {
  images: { where: { isPrimary: true }, take: 1 },
  category: { select: { id: true, name: true, slug: true } },
};

const INCLUDE_DETAIL = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: true,
  _count: true,
};

@Injectable()
export class ProductRepositoryPrisma implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Liste avec filtres ───────────────────────────────────────────────
  async findAllWithFilters(
    filters: ProductFilters,
  ): Promise<PaginatedProducts> {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt_desc',
      inStock,
      search,
    } = filters;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(minPrice !== undefined && { priceTtc: { gte: minPrice } }),
      ...(maxPrice !== undefined && { priceTtc: { lte: maxPrice } }),
      ...(inStock && { stockQuantity: { gt: 0 } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          {
            shortDescription: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          { tags: { has: search } },
        ],
      }),
    };

    const orderBy: Record<string, string> = {
      price_asc: 'priceTtc_asc',
      price_desc: 'priceTtc_desc',
      name_asc: 'name_asc',
    };

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(sort),
        include: INCLUDE_LIST,
      }),
    ]);

    return {
      data: products.map(this.mapProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(): Promise<IProduct[]> {
    const result = await this.findAllWithFilters({});
    return result.data;
  }

  async count(): Promise<number> {
    return this.prisma.product.count({ where: { isActive: true } });
  }

  async findById(id: string): Promise<IProduct | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: INCLUDE_DETAIL,
    });
    return product ? this.mapProduct(product) : null;
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    const product = await this.prisma.product.create({
      data: data as any,
      include: INCLUDE_DETAIL,
    });
    return this.mapProduct(product);
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) return null;
    const product = await this.prisma.product.update({
      where: { id },
      data: data as any,
      include: INCLUDE_DETAIL,
    });
    return this.mapProduct(product);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    const product = await this.prisma.product.findFirst({
      where: { slug, isActive: true },
      include: INCLUDE_DETAIL,
    });
    return product ? this.mapProduct(product) : null;
  }

  async findFeatured(): Promise<IProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: INCLUDE_LIST,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(this.mapProduct);
  }

  async findNewArrivals(limit: number): Promise<IProduct[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: INCLUDE_LIST,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return products.map(this.mapProduct);
  }

  async findBestSellers(limit: number): Promise<IProduct[]> {
    const topItems = await this.prisma.$queryRaw<
      Array<{ productId: string; quantity: number }>
    >`
      SELECT product_id AS "productId", SUM(quantity) AS quantity
      FROM order_items
      GROUP BY product_id
      ORDER BY quantity DESC
      LIMIT ${limit}
    `;

    const ids = topItems.map((i) => i.productId);
    if (!ids.length) return [];

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      include: INCLUDE_LIST,
    });

    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map(this.mapProduct);
  }

  async findBySearch(
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedProducts> {
    return this.findAllWithFilters({ search: query, page, limit });
  }

  async findRelated(productId: string, limit: number): Promise<IProduct[]> {
    const found = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (!found) return [];

    const products = await this.prisma.product.findMany({
      where: {
        categoryId: found.categoryId,
        isActive: true,
        id: { not: productId },
      },
      include: INCLUDE_LIST,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(this.mapProduct);
  }

  // ─── Catégories ───────────────────────────────────────────────────────
  async findAllCategories(): Promise<IProductCategory[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map(this.mapCategory);
  }

  async findCategoryBySlug(slug: string): Promise<IProductCategory | null> {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    return category ? this.mapCategory(category) : null;
  }

  async createCategory(
    data: Partial<IProductCategory>,
  ): Promise<IProductCategory> {
    const category = await this.prisma.category.create({ data: data as any });
    return this.mapCategory(category);
  }

  async updateCategory(
    id: string,
    data: Partial<IProductCategory>,
  ): Promise<IProductCategory | null> {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) return null;
    const category = await this.prisma.category.update({
      where: { id },
      data: data as any,
    });
    return this.mapCategory(category);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  // ─── Images ───────────────────────────────────────────────────────────
  async addImage(
    productId: string,
    data: Omit<
      IProductImage,
      'id' | 'productId' | 'isPrimary' | 'sortOrder' | 'createdAt'
    > & { url: string },
  ): Promise<IProductImage> {
    const count = await this.prisma.productImage.count({
      where: { productId },
    });
    const image = await this.prisma.productImage.create({
      data: {
        productId,
        isPrimary: count === 0,
        sortOrder: count,
        ...data,
      },
    });
    return {
      ...image,
      altText: image.altText ?? undefined,
    };
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image?.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (next)
        await this.prisma.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
    }
  }

  async reorderImages(productId: string, imageIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.productImage.update({
          where: { id, productId },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);
  }

  // ─── Admin ────────────────────────────────────────────────────────────
  async toggleActive(id: string): Promise<IProduct | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
    return this.mapProduct(updated);
  }

  async updateStock(
    id: string,
    stockQuantity: number,
  ): Promise<IProduct | null> {
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) return null;
    const updated = await this.prisma.product.update({
      where: { id },
      data: { stockQuantity },
    });
    return this.mapProduct(updated);
  }

  async findLowStock(): Promise<IProduct[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, name, sku, stock_quantity, low_stock_threshold
      FROM products
      WHERE is_active = true AND stock_quantity <= low_stock_threshold
      ORDER BY stock_quantity ASC
    `;
  }

  // ─── Helpers privés ───────────────────────────────────────────────────
  private buildOrderBy(sort: string): Record<string, 'asc' | 'desc'> {
    const map: Record<string, Record<string, 'asc' | 'desc'>> = {
      price_asc: { priceTtc: 'asc' },
      price_desc: { priceTtc: 'desc' },
      createdAt_desc: { createdAt: 'desc' },
      name_asc: { name: 'asc' },
    };
    return map[sort] ?? { createdAt: 'desc' };
  }

  private mapProduct(raw: any): IProduct {
    return {
      ...raw,
      price: raw.price ? Number(raw.price) : undefined,
      priceTtc: raw.priceTtc ? Number(raw.priceTtc) : undefined,
      compareAtPrice: raw.compareAtPrice
        ? Number(raw.compareAtPrice)
        : undefined,
      alcoholDegree: raw.alcoholDegree ? Number(raw.alcoholDegree) : undefined,
      shortDescription: raw.shortDescription ?? undefined,
    };
  }

  private mapCategory(raw: any): IProductCategory {
    return {
      ...raw,
      description: raw.description ?? undefined,
      imageUrl: raw.imageUrl ?? undefined,
      parentId: raw.parentId ?? undefined,
    };
  }
}

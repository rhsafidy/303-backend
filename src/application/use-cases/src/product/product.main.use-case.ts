// src/application/use-cases/src/product/product.main.use-case.ts
// Use case produits — étend BaseUseCases (getAll, getById, delete gratuits)
// Ajoute les méthodes métier spécifiques au catalogue 303 Export
// Règle : CRUD simple = ici. Logique 3+ entités = service applicatif dédié.

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCases } from '../../base.use-case';

import type {
  CreateProductData,
  UpdateProductData,
  CreateCategoryData,
  UpdateCategoryData,
  AddImageData,
  ReorderImagesData,
} from '@application/types/product/product.types';
import type {
  IProduct,
  IProductCategory,
  IProductImage,
} from '@domain/interfaces/product.interface';
import type {
  IProductRepository,
  ProductFilters,
} from '@domain/repositories/src/product.repository';

@Injectable()
export class MainProductUseCases extends BaseUseCases<IProduct> {
  constructor(
    // Token d'injection — lié à l'implémentation concrète dans le module
    @Inject('ProductRepository')
    private readonly productRepository: IProductRepository,
  ) {
    super(productRepository);
  }

  // ═══════════════════════════════════════════════════════
  // CATALOGUE PUBLIC
  // ═══════════════════════════════════════════════════════

  async getProductsWithFilters(filters: ProductFilters) {
    return this.productRepository.findAllWithFilters(filters);
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Produit introuvable : ${slug}`);
    }
    return product;
  }

  async getFeaturedProducts(): Promise<IProduct[]> {
    return this.productRepository.findFeatured();
  }

  async getNewArrivals(): Promise<IProduct[]> {
    return this.productRepository.findNewArrivals(8);
  }

  async getBestSellers(): Promise<IProduct[]> {
    return this.productRepository.findBestSellers(10);
  }

  async searchProducts(query: string, page: number, limit: number) {
    return this.productRepository.findBySearch(query, page, limit);
  }

  async getRelatedProducts(productId: string): Promise<IProduct[]> {
    return this.productRepository.findRelated(productId, 4);
  }

  // ═══════════════════════════════════════════════════════
  // ADMIN — CRUD PRODUITS
  // ═══════════════════════════════════════════════════════

  async createProduct(data: CreateProductData): Promise<IProduct> {
    return this.productRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<IProduct> {
    const updated = await this.productRepository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Produit introuvable : ${id}`);
    }
    return updated;
  }

  async toggleProductActive(id: string): Promise<IProduct> {
    const updated = await this.productRepository.toggleActive(id);
    if (!updated) {
      throw new NotFoundException(`Produit introuvable : ${id}`);
    }
    return updated;
  }

  async updateProductStock(
    id: string,
    stockQuantity: number,
  ): Promise<IProduct> {
    const updated = await this.productRepository.updateStock(id, stockQuantity);
    if (!updated) {
      throw new NotFoundException(`Produit introuvable : ${id}`);
    }
    return updated;
  }

  async getLowStockProducts(): Promise<IProduct[]> {
    return this.productRepository.findLowStock();
  }

  // ═══════════════════════════════════════════════════════
  // CATÉGORIES
  // ═══════════════════════════════════════════════════════

  async getAllCategories(): Promise<IProductCategory[]> {
    return this.productRepository.findAllCategories();
  }

  async getCategoryBySlug(slug: string): Promise<IProductCategory> {
    const category = await this.productRepository.findCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Catégorie introuvable : ${slug}`);
    }
    return category;
  }

  async createCategory(data: CreateCategoryData): Promise<IProductCategory> {
    return this.productRepository.createCategory(data);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryData,
  ): Promise<IProductCategory> {
    const updated = await this.productRepository.updateCategory(id, data);
    if (!updated) {
      throw new NotFoundException(`Catégorie introuvable : ${id}`);
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    return this.productRepository.deleteCategory(id);
  }

  // ═══════════════════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════════════════

  async addProductImage(
    productId: string,
    data: AddImageData,
  ): Promise<IProductImage> {
    // Vérifier que le produit existe avant d'ajouter l'image
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Produit introuvable : ${productId}`);
    }
    return this.productRepository.addImage(productId, data);
  }

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    return this.productRepository.deleteImage(productId, imageId);
  }

  async reorderProductImages(
    productId: string,
    data: ReorderImagesData,
  ): Promise<void> {
    return this.productRepository.reorderImages(productId, data.imageIds);
  }

  async setProductPrimaryImage(
    productId: string,
    imageId: string,
  ): Promise<void> {
    return this.productRepository.setPrimaryImage(productId, imageId);
  }
}

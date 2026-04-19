// src/domain/repositories/src/product.repository.ts
// Contrat spécifique produits — étend BaseRepository
// Ajoute uniquement les méthodes métier propres au catalogue

import { BaseRepository } from '@domain/repositories/base.repository';
import {
  IProduct,
  IProductCategory,
  IProductImage,
} from '@domain/interfaces/product.interface';

// Paramètres de filtrage pour la liste produits
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string; // slug de catégorie
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'createdAt_desc' | 'name_asc';
  inStock?: boolean;
  search?: string;
}

export interface PaginatedProducts {
  data: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository extends BaseRepository<IProduct> {
  // ─── Catalogue public ──────────────────────────────────────
  findAllWithFilters(filters: ProductFilters): Promise<PaginatedProducts>;
  findBySlug(slug: string): Promise<IProduct | null>;
  findFeatured(): Promise<IProduct[]>;
  findNewArrivals(limit: number): Promise<IProduct[]>;
  findBestSellers(limit: number): Promise<IProduct[]>;
  findBySearch(
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedProducts>;
  findRelated(productId: string, limit: number): Promise<IProduct[]>;

  // ─── Catégories ────────────────────────────────────────────
  findAllCategories(): Promise<IProductCategory[]>;
  findCategoryBySlug(slug: string): Promise<IProductCategory | null>;
  createCategory(data: Partial<IProductCategory>): Promise<IProductCategory>;
  updateCategory(
    id: string,
    data: Partial<IProductCategory>,
  ): Promise<IProductCategory | null>;
  deleteCategory(id: string): Promise<void>;

  // ─── Images ────────────────────────────────────────────────
  addImage(
    productId: string,
    data: Partial<IProductImage>,
  ): Promise<IProductImage>;
  deleteImage(productId: string, imageId: string): Promise<void>;
  reorderImages(productId: string, imageIds: string[]): Promise<void>;
  setPrimaryImage(productId: string, imageId: string): Promise<void>;

  // ─── Admin ─────────────────────────────────────────────────
  toggleActive(id: string): Promise<IProduct | null>;
  updateStock(id: string, stockQuantity: number): Promise<IProduct | null>;
  findLowStock(): Promise<IProduct[]>;
}

// src/domain/interfaces/i-product.interface.ts
// Couche Domain : aucune dépendance externe (pas de NestJS, pas de Prisma)
// Correspond exactement à la table products du schéma PostgreSQL

export interface IProduct {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number; // Prix HT
  priceTtc?: number; // Prix TTC — prix affiché
  compareAtPrice?: number; // Prix barré (promo)
  sku?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
  category?: IProductCategory;
  images?: IProductImage[];
  alcoholDegree?: number; // Déclenche vérification âge 18+ côté front
  volumeMl?: number;
  originCountry?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  avgRating?: number; // Champ calculé, non persisté
  reviewCount?: number; // Champ calculé, non persisté
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductCategory {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductImage {
  id?: string;
  productId?: string;
  url?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  createdAt?: Date;
}

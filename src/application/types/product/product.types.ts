// src/application/types/product/product.types.ts
// Types applicatifs internes — distincts des DTOs HTTP
// Ne sont jamais envoyés directement à l'API

export interface CreateProductData {
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceTtc: number;
  compareAtPrice?: number;
  sku: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId: string;
  alcoholDegree?: number;
  volumeMl?: number;
  originCountry?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface CreateCategoryData {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface AddImageData {
  url: string;
  altText?: string;
}

export interface ReorderImagesData {
  imageIds: string[]; // IDs dans le nouvel ordre
}

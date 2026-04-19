// src/presentation/dtos/product/product.dto.ts
// DTOs HTTP — valident les données entrantes via class-validator
// Distincts des types applicatifs internes (application/types/)

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsPositive,
  Min,
  IsInt,
  MaxLength,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ─── Query Params — GET /products ─────────────────────────────────────
export class GetProductsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @ApiPropertyOptional({ description: 'Slug de catégorie' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ['price_asc', 'price_desc', 'createdAt_desc', 'name_asc'],
  })
  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'createdAt_desc' | 'name_asc' =
    'createdAt_desc';

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

// ─── Create Product ─────────────────────────────────────────────────
export class CreateProductDto {
  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ description: 'Prix TTC affiché au client' })
  @IsNumber()
  @IsPositive()
  priceTtc!: number;

  @ApiPropertyOptional({ description: 'Prix barré (promo)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  compareAtPrice?: number;

  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'UUID de la catégorie' })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Degré alcool — déclenche vérification 18+',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  alcoholDegree?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  volumeMl?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originCountry?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;
}

// ─── Update Product (tous les champs optionnels) ─────────────────────
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// ─── Update Stock ────────────────────────────────────────────────────
export class UpdateStockDto {
  @ApiProperty({ description: 'Nouvelle quantité en stock', minimum: 0 })
  @IsInt()
  @Min(0)
  stockQuantity!: number;
}

// ─── Create Category ─────────────────────────────────────────────────
export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'UUID de la catégorie parente' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

// ─── Add Image ───────────────────────────────────────────────────────
export class AddImageDto {
  @ApiProperty({ description: "URL de l'image (après upload S3/R2)" })
  @IsString()
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;
}

// ─── Reorder Images ──────────────────────────────────────────────────
export class ReorderImagesDto {
  @ApiProperty({
    type: [String],
    description: 'IDs des images dans le nouvel ordre',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  imageIds!: string[];
}

// ─── Search Query ────────────────────────────────────────────────────
export class SearchQueryDto {
  @ApiProperty({ description: 'Terme de recherche' })
  @IsString()
  @MaxLength(100)
  q!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}

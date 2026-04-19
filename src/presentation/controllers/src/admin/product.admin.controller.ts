//src/presentation/controllers/src/admin/product.admin.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { MainProductUseCases } from '@application/use-cases/src/product/product.main.use-case';
import { IProduct } from '@domain/interfaces/product.interface';
import {
  GetProductsQueryDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  AddImageDto,
  ReorderImagesDto,
  SearchQueryDto,
} from '@presentation/dtos/product/product.dto';

// ═══════════════════════════════════════════════════════════════════════
// ADMIN PRODUITS — /api/v1/admin/products
// Auth JWT Admin requise sur toutes ces routes (à ajouter via guard global)
// ═══════════════════════════════════════════════════════════════════════
@ApiTags('Admin — Products')
@ApiBearerAuth()
@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly productUseCases: MainProductUseCases) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto) {
    return this.productUseCases.createProduct(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un produit existant' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productUseCases.updateProduct(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un produit (soft delete)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.productUseCases.delete(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activer / Désactiver la visibilité' })
  async toggleActive(@Param('id') id: string) {
    return this.productUseCases.toggleProductActive(id);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Mettre à jour le stock manuellement' })
  async updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.productUseCases.updateProductStock(id, dto.stockQuantity);
  }

  // ─── Images ───────────────────────────────────────────────────────
  @Post(':id/images')
  @ApiOperation({ summary: 'Ajouter une image produit' })
  @HttpCode(HttpStatus.CREATED)
  async addImage(@Param('id') id: string, @Body() dto: AddImageDto) {
    return this.productUseCases.addProductImage(id, dto);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Supprimer une image' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productUseCases.deleteProductImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  @ApiOperation({ summary: 'Réordonner les images' })
  async reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    return this.productUseCases.reorderProductImages(id, dto);
  }

  @Patch(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Définir une image comme principale' })
  async setPrimaryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productUseCases.setProductPrimaryImage(id, imageId);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// ADMIN CATÉGORIES — /api/v1/admin/categories
// ═══════════════════════════════════════════════════════════════════════
@ApiTags('Admin — Categories')
@ApiBearerAuth()
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly productUseCases: MainProductUseCases) {}

  @Post()
  @ApiOperation({ summary: 'Créer une catégorie' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto) {
    return this.productUseCases.createCategory(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une catégorie' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.productUseCases.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.productUseCases.deleteCategory(id);
  }
}

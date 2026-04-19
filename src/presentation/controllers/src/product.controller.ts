// src/presentation/controllers/product.controller.ts
// Controller produits — étend BaseController (getAll, getById, delete gratuits)
// Expose tous les endpoints du catalogue 303 Export
// Aucune logique métier — délègue tout au use case

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
import { BaseController } from '../base.controller';
import { MainProductUseCases } from '../../../application/use-cases/src/product/product.main.use-case';
import { IProduct } from '../../../domain/interfaces/product.interface';
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
// CATALOGUE PUBLIC — /api/v1/products
// ═══════════════════════════════════════════════════════════════════════
@ApiTags('Products')
@Controller('products')
export class ProductController extends BaseController<IProduct> {
  constructor(private readonly productUseCases: MainProductUseCases) {
    super(productUseCases);
  }

  // ─── Surcharge de @Get() — liste avec filtres ──────────────────────
  // La surcharge remplace le getAll() hérité de BaseController
  @Get()
  @ApiOperation({
    summary: 'Liste produits — pagination, filtres, tri, recherche',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Slug catégorie',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['price_asc', 'price_desc', 'createdAt_desc', 'name_asc'],
  })
  async getAllProduct(@Query() query: GetProductsQueryDto) {
    return this.productUseCases.getProductsWithFilters(query);
  }

  // ─── Produits mis en avant ─────────────────────────────────────────
  @Get('featured')
  @ApiOperation({ summary: 'Produits mis en avant (homepage)' })
  async getFeatured() {
    return this.productUseCases.getFeaturedProducts();
  }

  // ─── Nouveaux produits ────────────────────────────────────────────
  @Get('new-arrivals')
  @ApiOperation({ summary: '8 derniers produits' })
  async getNewArrivals() {
    return this.productUseCases.getNewArrivals();
  }

  // ─── Meilleures ventes ────────────────────────────────────────────
  @Get('best-sellers')
  @ApiOperation({ summary: 'Top ventes' })
  async getBestSellers() {
    return this.productUseCases.getBestSellers();
  }

  // ─── Recherche full-text ──────────────────────────────────────────
  // Déclaré AVANT /:slug pour éviter le conflit de route
  @Get('search')
  @ApiOperation({ summary: 'Recherche plein texte sur nom + description' })
  async search(@Query() query: SearchQueryDto) {
    return this.productUseCases.searchProducts(
      query.q,
      query.page ?? 1,
      query.limit ?? 12,
    );
  }

  // ─── Fiche produit par slug SEO ───────────────────────────────────
  @Get(':slug')
  @ApiOperation({ summary: 'Fiche produit détaillée par slug SEO' })
  @ApiParam({
    name: 'slug',
    description: 'Slug du produit (ex: rhum-303-premium)',
  })
  async getBySlug(@Param('slug') slug: string) {
    return this.productUseCases.getProductBySlug(slug);
  }

  // ─── Produits similaires ──────────────────────────────────────────
  @Get(':id/related')
  @ApiOperation({ summary: 'Produits similaires (même catégorie)' })
  @ApiParam({ name: 'id', description: 'UUID du produit' })
  async getRelated(@Param('id') id: string) {
    return this.productUseCases.getRelatedProducts(id);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CATÉGORIES PUBLIQUES — /api/v1/categories
// ═══════════════════════════════════════════════════════════════════════
@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly productUseCases: MainProductUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories actives' })
  async getAllCategories() {
    return this.productUseCases.getAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: "Produits d'une catégorie par slug" })
  @ApiParam({ name: 'slug' })
  async getCategoryProducts(
    @Param('slug') slug: string,
    @Query() query: GetProductsQueryDto,
  ) {
    return this.productUseCases.getProductsWithFilters({
      ...query,
      category: slug,
    });
  }
}

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

// src/presentation/controllers/clients/product.controller.ts
// Controller produits — étend BaseController (getAll, getById, delete gratuits)
// Expose tous les endpoints du catalogue 303 Export
// Aucune logique métier — délègue tout au use case

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BaseController } from '@presentation/controllers/base.controller';
import { MainProductUseCases } from '@application/use-cases/src/product/product.main.use-case';
import { IProduct } from '@domain/interfaces/product.interface';
import {
  GetProductsQueryDto,
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

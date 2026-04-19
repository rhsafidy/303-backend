// src/product.module.ts
// Module NestJS — seul endroit qui connaît les implémentations concrètes
// Lie interfaces → implémentations via les tokens @Inject
// Règle : un module exporte uniquement les use cases et services consommés
//         par d'autres modules. Les repositories ne s'exportent jamais.

import { Module } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { ProductRepositoryPrisma } from '@infrastructure/database/prisma/repositories/src/product.repository.prisma';
import { MainProductUseCases } from '@application/use-cases/src/product/product.main.use-case';
import {
  ProductController,
  CategoryController,
  AdminProductController,
  AdminCategoryController,
} from '../presentation/controllers/src/product.controller';

@Module({
  controllers: [
    ProductController, // GET /api/v1/products/*
    CategoryController, // GET /api/v1/categories/*
    AdminProductController, // CRUD /api/v1/admin/products/*
    AdminCategoryController, // CRUD /api/v1/admin/categories/*
  ],
  providers: [
    // ─── Infrastructure ──────────────────────────────────────────
    PrismaService,

    // ─── Liaison interface → implémentation concrète via token ───
    // Le use case reçoit IProductRepository via @Inject('ProductRepository')
    // Il ne connaît jamais ProductRepositoryPrisma directement
    {
      provide: 'ProductRepository',
      useClass: ProductRepositoryPrisma,
    },

    // ─── Application ─────────────────────────────────────────────
    MainProductUseCases,
  ],

  // Exporter uniquement ce que les autres modules consomment
  exports: [MainProductUseCases],
})
export class ProductModule {}

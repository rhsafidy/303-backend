// src/presentation/controllers/base.controller.ts
// Controller de base — CRUD automatique (get all, get by id, delete)
// Les controllers spécifiques l'étendent et surchargent si besoin

import { Get, Param, Delete } from '@nestjs/common';
import { BaseUseCases } from '@application/use-cases/base.use-case';

export abstract class BaseController<T> {
  constructor(protected readonly useCases: BaseUseCases<T>) {}

  @Get()
  async getAll(): Promise<T[]> {
    return this.useCases.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<T | null> {
    return this.useCases.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.useCases.delete(id);
  }
}

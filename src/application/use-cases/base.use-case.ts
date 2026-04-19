// src/application/use-cases/base.use-case.ts
// CRUD générique — toutes les entités héritent de cette classe
// Fournit getAll, getById, delete gratuitement

import { BaseRepository } from '@domain/repositories/base.repository';

export abstract class BaseUseCases<T> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  async getAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

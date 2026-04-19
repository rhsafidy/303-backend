// src/infrastructure/database/prisma/repositories/base.repository.prisma.ts
// Implémentation générique du BaseRepository avec Prisma
// Adapté Prisma (pas TypeORM comme dans le doc de référence)
// Les repositories concrets héritent de cette classe

import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@domain/repositories/base.repository';

@Injectable()
export abstract class BaseRepositoryPrisma<
  T extends { id?: string },
> implements BaseRepository<T> {
  // Chaque sous-classe injecte son delegate Prisma (prisma.product, prisma.category…)
  constructor(protected readonly delegate: any) {}

  findAll(): Promise<T[]> {
    return this.delegate.findMany();
  }

  findById(id: string): Promise<T | null> {
    return this.delegate.findUnique({ where: { id } });
  }

  async create(entity: Partial<T>): Promise<T> {
    return this.delegate.create({ data: entity });
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    return this.delegate.update({ where: { id }, data: entity });
  }

  async delete(id: string): Promise<void> {
    await this.delegate.delete({ where: { id } });
  }

  count(): Promise<number> {
    return this.delegate.count();
  }
}

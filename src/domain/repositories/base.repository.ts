// src/domain/repositories/base.repository.ts
// Contrat universel — toutes les entités héritent de ce contrat
// Les repositories spécifiques l'étendent uniquement pour ajouter des méthodes métier

export interface BaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

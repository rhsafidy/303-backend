# 303 Export — Backend API

> Plateforme e-commerce spécialisée dans la vente de spiritueux à l'export.
> Stack : **NestJS 11 · Prisma 7 · PostgreSQL 16 · TypeScript · pnpm**

---

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes Prisma](#commandes-prisma)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Structure des fichiers](#structure-des-fichiers)
- [Endpoints API](#endpoints-api)
- [Conventions](#conventions)
- [Troubleshooting](#troubleshooting)

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 22.x |
| pnpm | 9.x |
| PostgreSQL | 16.x |
| TypeScript | 5.x |

---

## Installation

```bash
# Cloner le repo
git clone <repo-url>
cd backend

# Installer les dépendances
pnpm install

# Copier les variables d'environnement
cp .env.example .env
# → Éditer .env avec vos valeurs (voir section ci-dessous)

# Générer le client Prisma
npx prisma generate

# Créer les tables en base
npx prisma migrate dev --name init

# Démarrer en développement
pnpm run start:dev
```

Swagger disponible sur : **http://localhost:3000/api**

---

## Variables d'environnement

```dotenv
# Connexion PostgreSQL directe (utilisée par PrismaService et les migrations)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/303?schema=public"

# Optionnel — uniquement si vous utilisez Prisma Accelerate local
# Généré automatiquement par 'npx prisma dev'
PRISMA_ACCELERATE_URL="prisma+postgres://localhost:51213/?api_key=..."

# Environnement (contrôle les logs Prisma : query/warn/error en dev, error seul en prod)
NODE_ENV="development"

# Port HTTP de l'API
PORT=3000
```

> **Note :** `PRISMA_ACCELERATE_URL` n'est nécessaire que si vous utilisez le proxy local Prisma Postgres. Dans la plupart des cas, `DATABASE_URL` suffit.

---

## Commandes Prisma

### Génération & Setup

```bash
# Générer le client Prisma (obligatoire après tout changement de schéma)
npx prisma generate

# Ouvrir Prisma Studio (interface BDD graphique)
npx prisma studio

# Valider la syntaxe du schéma
npx prisma validate

# Formater le fichier schéma
npx prisma format

# Démarrer le proxy Prisma Postgres local (si PRISMA_ACCELERATE_URL est utilisée)
npx prisma dev
```

### Migrations

```bash
# Créer et appliquer une migration en développement
npx prisma migrate dev --name <nom_descriptif>

# Exemples :
npx prisma migrate dev --name init
npx prisma migrate dev --name add_order_table
npx prisma migrate dev --name add_review_field_to_product

# Voir l'état des migrations
npx prisma migrate status

# Voir la différence schéma ↔ BDD (sans appliquer)
npx prisma migrate diff

# ⚠️ DESTRUCTIF — Réinitialiser toute la base (dev uniquement)
npx prisma migrate reset

# Appliquer les migrations en production (sans interaction)
npx prisma migrate deploy
```

### Base de données

```bash
# Synchroniser le schéma sans migration (prototypage rapide, ne pas utiliser en prod)
npx prisma db push

# Introspecter la BDD existante → met à jour schema.prisma
npx prisma db pull

# Lancer le seed
npx prisma db seed
```

---

## Démarrage

```bash
# Développement (watch mode)
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod

# Si vous utilisez PRISMA_ACCELERATE_URL, démarrer le proxy dans un terminal séparé :
npx prisma dev
# puis dans un autre terminal :
pnpm run start:dev
```

---

## Architecture

Le projet suit la **Clean Architecture** (Uncle Bob), adaptée à NestJS. Les dépendances pointent toujours vers l'intérieur.

```
┌──────────────────────────────────────────────────────┐
│         PRESENTATION  (Controllers, DTOs)            │
├──────────────────────────────────────────────────────┤
│         APPLICATION   (Use Cases, Types)             │
├──────────────────────────────────────────────────────┤
│         DOMAIN        (Interfaces, Contrats)         │
├──────────────────────────────────────────────────────┤
│         INFRASTRUCTURE (Prisma, Repositories)        │
└──────────────────────────────────────────────────────┘
```

### Flux d'une requête

```
Client HTTP
  → Controller          (valide DTO, appelle use case)
  → Use Case            (logique métier, appelle IRepository)
  → Repository Prisma   (implémente IRepository, requêtes BDD)
  → PrismaService       (connexion PostgreSQL)
  → PostgreSQL
```

### Couche Domain

Aucune dépendance externe. Interfaces TypeScript pures.

- `domain/interfaces/product.interface.ts` — `IProduct`, `IProductCategory`, `IProductImage`
- `domain/repositories/base.repository.ts` — `BaseRepository<T>` (findAll, findById, create, update, delete, count)
- `domain/repositories/src/product.repository.ts` — `IProductRepository` (étend BaseRepository + méthodes catalogue)

### Couche Application

Logique métier. Ne connaît jamais Prisma.

- `application/use-cases/base.use-case.ts` — `BaseUseCases<T>`
- `application/use-cases/src/product/product.main.use-case.ts` — `MainProductUseCases`
- `application/types/product/product.types.ts` — Types internes (CreateProductData, etc.)

### Couche Infrastructure

Seul endroit où Prisma est utilisé.

- `infrastructure/database/prisma/prisma.service.ts` — `PrismaService extends PrismaClient`
- `infrastructure/database/prisma/repositories/src/product.repository.prisma.ts` — Implémentation concrète

### Couche Presentation

Controllers HTTP et DTOs.

- `presentation/controllers/src/clients/product.controller.ts`
- `presentation/controllers/src/admin/product.admin.controller.ts`
- `presentation/dtos/product/product.dto.ts`

### Module NestJS

`modules/product.module.ts` est le **seul endroit** qui connaît les implémentations concrètes et lie les tokens d'injection :

```typescript
{
  provide: 'ProductRepository',
  useClass: ProductRepositoryPrisma,
}
```

---

## Structure des fichiers

```
src/
├── app.module.ts
├── main.ts
├── modules/
│   └── product.module.ts
├── domain/
│   ├── interfaces/
│   │   └── product.interface.ts
│   └── repositories/
│       ├── base.repository.ts
│       └── src/
│           └── product.repository.ts
├── application/
│   ├── use-cases/
│   │   ├── base.use-case.ts
│   │   └── src/product/
│   │       └── product.main.use-case.ts
│   └── types/product/
│       └── product.types.ts
├── infrastructure/
│   └── database/prisma/
│       ├── prisma.service.ts
│       ├── schema/
│       │   └── schema.prisma
│       ├── migrations/
│       ├── generated/          ← Ne pas éditer manuellement
│       └── repositories/
│           ├── base.repository.prisma.ts
│           └── src/
│               └── product.repository.prisma.ts
└── presentation/
    ├── controllers/
    │   ├── base.controller.ts
    │   └── src/
    │       ├── clients/product.controller.ts
    │       └── admin/product.admin.controller.ts
    └── dtos/product/
        └── product.dto.ts
```

---

## Endpoints API

### Catalogue public

| Méthode | Route | Description |
|---|---|---|
| GET | `/products` | Liste paginée (page, limit, category, sort, inStock, search, minPrice, maxPrice) |
| GET | `/products/featured` | Produits mis en avant |
| GET | `/products/new-arrivals` | 8 derniers produits |
| GET | `/products/best-sellers` | Top 10 ventes |
| GET | `/products/search?q=...` | Recherche full-text |
| GET | `/products/:slug` | Fiche produit par slug SEO |
| GET | `/products/:id/related` | 4 produits similaires |
| GET | `/products/:id` | Produit par UUID |
| GET | `/categories` | Toutes catégories actives |
| GET | `/categories/:slug` | Produits d'une catégorie |

### Admin (JWT requis)

| Méthode | Route | Description |
|---|---|---|
| POST | `/admin/products` | Créer un produit |
| PATCH | `/admin/products/:id` | Modifier un produit |
| DELETE | `/admin/products/:id` | Supprimer un produit |
| PATCH | `/admin/products/:id/toggle-active` | Activer/désactiver |
| PATCH | `/admin/products/:id/stock` | Mettre à jour le stock |
| POST | `/admin/products/:id/images` | Ajouter une image |
| DELETE | `/admin/products/:id/images/:imageId` | Supprimer une image |
| PATCH | `/admin/products/:id/images/reorder` | Réordonner les images |
| PATCH | `/admin/products/:id/images/:imageId/primary` | Définir image principale |
| POST | `/admin/categories` | Créer une catégorie |
| PATCH | `/admin/categories/:id` | Modifier une catégorie |
| DELETE | `/admin/categories/:id` | Supprimer une catégorie |

---

## Conventions

### Règles absolues

- Un **controller** ne contient **jamais** de logique métier
- Un **use case** ne connaît **jamais** Prisma
- Un **repository** implémente une **interface domain**, pas une classe concrète
- Les **DTOs HTTP** sont distincts des **types applicatifs** internes
- Le dossier `generated/` n'est **jamais** édité manuellement
- Les **tokens d'injection** (`'ProductRepository'`) sont définis dans le **module uniquement**

### Nommage

| Type | Convention | Exemple |
|---|---|---|
| Interface domain | `I` + PascalCase | `IProduct`, `IProductRepository` |
| Use case | Nom + `UseCases` | `MainProductUseCases` |
| Repository | Nom + `RepositoryPrisma` | `ProductRepositoryPrisma` |
| DTO | Action + Nom + `Dto` | `CreateProductDto` |
| Module | Domaine + `Module` | `ProductModule` |

### Ajouter un nouveau domaine métier

1. Interface → `domain/interfaces/<entity>.interface.ts`
2. Contrat repo → `domain/repositories/src/<entity>.repository.ts`
3. Implémentation → `infrastructure/database/prisma/repositories/src/<entity>.repository.prisma.ts`
4. Use case → `application/use-cases/src/<entity>/<entity>.main.use-case.ts`
5. Controller → `presentation/controllers/src/clients/<entity>.controller.ts`
6. Module → `modules/<entity>.module.ts`
7. Import dans `AppModule`

---

## Troubleshooting

| Erreur | Solution |
|---|---|
| `ECONNREFUSED 127.0.0.1:51213` | Lancer `npx prisma dev` dans un terminal séparé, ou utiliser `DATABASE_URL` directement |
| `@prisma/client did not initialize yet` | Lancer `npx prisma generate` |
| `Cannot read properties of undefined (reading 'product')` | `PrismaService` doit `extends PrismaClient`, pas avoir un champ privé |
| `ValidationError` sur un DTO | Vérifier que `app.useGlobalPipes(new ValidationPipe({ transform: true }))` est dans `main.ts` |
| Migration déjà appliquée | `npx prisma migrate status` — ne jamais modifier `_prisma_migrations` manuellement |

---

## Swagger

Documentation API interactive disponible sur **http://localhost:3000/api** après démarrage.

---

*303 Export — Architecture v1.0.0 — Confidentiel*

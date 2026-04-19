// src/infrastructure/database/prisma/prisma.service.ts

import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('PrismaService');

  constructor() {
    const connectionString = process.env.DATABASE_URL ?? '';
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ Connecté à PostgreSQL via Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('🔌 Déconnecté de PostgreSQL');
  }
}

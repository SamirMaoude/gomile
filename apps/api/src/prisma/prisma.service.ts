import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    // Prisma v7 : l'adapter doit être passé comme ceci
    this.client = new PrismaClient({ adapter });
  }

  get user() {
    return this.client.user;
  }
  get merchant() {
    return this.client.merchant;
  }
  get driver() {
    return this.client.driver;
  }
  get store() {
    return this.client.store;
  }
  get order() {
    return this.client.order;
  }
  get handshake() {
    return this.client.handshake;
  }
  get kycSubmission() {
    return this.client.kycSubmission;
  }
  get wallet() {
    return this.client.wallet;
  }
  get walletEntry() {
    return this.client.walletEntry;
  }

  async onModuleInit() {
    await this.client.$connect();
    console.log(
      'Models:',
      Object.keys(this.client).filter(
        (k: string) => !k.startsWith('$') && !k.startsWith('_'),
      ),
    );
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}

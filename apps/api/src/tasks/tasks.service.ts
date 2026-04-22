import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // A cron that deletes unverified account at 2am for all non verified accounts more than 48h
  // Why 2am ? Because I sleep at 2am...
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteUnverifiedAccount () {
    // 2 days ago
    const limitDate = new Date(Date.now() - 48*60*60*1000)

    const {count} = await this.prisma.user.deleteMany({
      where: {
        emailVerified : false,
        createdAt: {
          lt: limitDate
        }
      }
    })
    this.logger.log(`Deleted ${count} unverified accounts`)
  }
}

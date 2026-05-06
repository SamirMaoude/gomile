import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [ScheduleModule.forRoot(), EmailsModule],
  providers: [TasksService],
})
export class TasksModule {}

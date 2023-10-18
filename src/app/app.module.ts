import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth';
import { ConnectorModule } from '@/connector';
import { EventsModule } from '@/events';
import { TaskModule } from '@/task';
import { UserModule } from '@/user';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_USER,
} from '@/common';

@Module({
  imports: [
    MongooseModule.forRoot(DATABASE_HOST, {
      dbName: DATABASE_NAME,
      user: DATABASE_USER,
      pass: DATABASE_PASSWORD,
    }),
    AuthModule,
    ConfigModule.forRoot(),
    ConnectorModule,
    EventsModule,
    UserModule,
    TaskModule,
  ],
})
export class AppModule {}

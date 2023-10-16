import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectorModule } from '@/connector';
import { EventsModule } from '@/events';

@Module({
  imports: [ConfigModule.forRoot(), ConnectorModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

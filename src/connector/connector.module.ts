import { Module } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserConnection,
  UserConnectionSchema,
} from './schemas/user-connection.schema';
import { ConnectorController } from './connector.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserConnection.name, schema: UserConnectionSchema },
    ]),
  ],
  controllers: [ConnectorController],
  providers: [ConnectorService],
  exports: [ConnectorService],
})
export class ConnectorModule {}

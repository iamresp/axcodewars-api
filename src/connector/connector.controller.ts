import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { AuthGuard } from '@/auth';
import { UserConnection } from './schemas/user-connection.schema';
import { PatchedRequest } from '@/auth/models';

@Controller('connector')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createUserConnection(
    @Request() req: PatchedRequest,
    @Body() payload: Pick<UserConnection, 'connId'>,
  ): Promise<void> {
    return this.connectorService.bind(req.user.uuid, payload.connId);
  }
}

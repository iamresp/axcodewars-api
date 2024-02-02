import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { AuthGuard } from '@/auth';
import { UserConnection } from './schemas/user-connection.schema';
import { PatchedRequest } from '@/auth';
import { User, UserService } from '@/user';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Controller('connector')
export class ConnectorController {
  constructor(
    private readonly connectorService: ConnectorService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createUserConnection(
    @Request() req: PatchedRequest,
    @Body() payload: Pick<UserConnection, 'connId'>,
  ): Promise<void> {
    return this.connectorService.bind(req.user.uuid, payload.connId);
  }

  @UseGuards(AuthGuard)
  @Get('validate')
  async validate(@Request() req: PatchedRequest): Promise<null | never> {
    const userConnection = await this.connectorService.findOne({
      userUuid: req.user.uuid,
    });

    if (userConnection) {
      throw new BadRequestException(
        createError(
          Errors.CONNECTION_ALREADY_EXISTS,
          `Connection ${userConnection.connId} already exists for user ${req.user.uuid}`,
        ),
      );
    }

    return null;
  }

  @UseGuards(AuthGuard)
  @Get('/:connId')
  async getUserByConnId(
    @Param('connId') connId: string,
  ): Promise<Pick<User, 'avatar' | 'username'>> {
    const userConnection = await this.connectorService.findOne({ connId });
    if (userConnection) {
      const user = await this.userService.findOne({
        uuid: userConnection.userUuid,
      });

      if (user) {
        const { avatar, username } = user;
        return { avatar, username };
      }
    }
  }
}

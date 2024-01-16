import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { AuthGuard } from '@/auth';
import { UserConnection } from './schemas/user-connection.schema';
import { PatchedRequest } from '@/auth/models';
import { User, UserService } from '@/user';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Controller('connector')
export class ConnectorController {
  private readonly logger = new Logger(ConnectorController.name);

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

  @UseGuards(AuthGuard)
  @Get('validate')
  async validate(@Request() req: PatchedRequest): Promise<null> {
    try {
      const userConnection = await this.connectorService.findOne({
        userUuid: req.user.uuid,
      });

      this.logger.log(
        `${req.user.uuid} => ${userConnection?.connId ?? 'none'}`,
      );

      if (userConnection) {
        this.logger.log('throw an exception');
        throw new BadRequestException(
          createError(
            Errors.CONNECTION_ALREADY_EXISTS,
            `Connection ${userConnection.connId} already exists for user ${req.user.uuid}`,
          ),
        );
      }

      this.logger.log('return null');
      return null;
    } catch (e: unknown) {
      this.logger.log(`error, ${req.user.uuid} => ${e}`);
    }
  }
}

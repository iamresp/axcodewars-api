import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { TUserDocument, User } from './schemas/user.schema';
import * as sha256 from 'sha256';
import { CreateUserResponseDto } from './models';
import { createError } from '@/utils';
import { Errors } from '@/common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private usersRepository: Model<TUserDocument>,
  ) {}

  /* Database methods */

  async findOne(knownData: Partial<User>): Promise<TUserDocument> {
    return this.usersRepository.findOne(knownData).exec();
  }

  async findById(id: string): Promise<TUserDocument> {
    return this.usersRepository.findById(id).exec();
  }

  async find(): Promise<TUserDocument[]> {
    return this.usersRepository.find().exec();
  }

  async findByIdAndUpdate(
    id: string,
    $set: Partial<User>,
  ): Promise<Omit<User, 'hash'>> {
    const user = await this.usersRepository
      .findByIdAndUpdate(id, { $set }, { new: true })
      .exec();

    const { avatar, username, uuid } = user;
    return { avatar, username, uuid };
  }

  /* API methods */

  async createUser(
    username: string,
    hash: string,
    avatar: string,
  ): Promise<CreateUserResponseDto> {
    const foundUser = await this.findOne({ username });
    if (foundUser) {
      throw new BadRequestException(
        createError(
          Errors.USER_ALREADY_EXISTS,
          `User ${username} already exists`,
        ),
      );
    }
    const uuid = uuidv4();
    const createdUser = new this.usersRepository({
      avatar,
      hash: sha256.x2(hash),
      username,
      uuid,
    });
    await createdUser.save();

    return { uuid };
  }
}

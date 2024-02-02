import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Task, TTaskDocument } from './schemas/task.schema';
import { CreateTasksResponseDto } from './models';
import { TaskUser, TTaskUserDocument } from './schemas/task-user.schema';

@Injectable()
export class TaskService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Task.name)
    private tasksRepository: Model<TTaskDocument>,
    @InjectModel(TaskUser.name)
    private taskUsersRepository: Model<TTaskUserDocument>,
  ) {}

  /* Database methods */

  async findOne(knownData: Partial<Task>): Promise<TTaskDocument> {
    return this.tasksRepository.findOne(knownData).exec();
  }

  async findById(id: string): Promise<TTaskDocument> {
    return this.tasksRepository.findById(id).exec();
  }

  async find(): Promise<TTaskDocument[]> {
    return this.tasksRepository.find().exec();
  }

  async findByTitle(title: string): Promise<TTaskDocument[]> {
    return this.tasksRepository.find({ title }).exec();
  }

  async updateOne(id: string, $set: Partial<Task>): Promise<TTaskDocument> {
    return this.tasksRepository
      .findByIdAndUpdate(id, { $set }, { new: true })
      .exec();
  }

  async deleteOne(uuid: string): Promise<boolean> {
    const session = await this.connection.startSession();
    session.startTransaction();
    const results = await Promise.all([
      this.tasksRepository.deleteOne({ uuid }).exec(),
      this.taskUsersRepository.deleteOne({ taskUuid: uuid }).exec(),
    ]);
    await session.commitTransaction();
    await session.endSession();

    return results.every(
      (result) => result.acknowledged && Boolean(result.deletedCount),
    );
  }

  async findAuthor(taskUuid: string): Promise<TTaskUserDocument> {
    return this.taskUsersRepository.findOne({ taskUuid }).exec();
  }

  /* API methods */

  async createTasks(
    payload: Task[],
    userUuid: string,
  ): Promise<CreateTasksResponseDto> {
    const omitted: Task[] = [];

    for (const task of payload) {
      const foundTask = await this.findOne({ title: task.title });

      if (foundTask) {
        omitted.push(task);
      }
    }

    const inserted = payload
      .filter((task) => !omitted.includes(task))
      .map((task) => {
        const uuid = uuidv4();
        return { ...task, uuid };
      });

    const userAuthorshipPayload: TaskUser[] = inserted.map(({ uuid }) => ({
      taskUuid: uuid,
      userUuid,
    }));

    const session = await this.connection.startSession();
    session.startTransaction();
    await this.tasksRepository.insertMany(inserted);
    await this.taskUsersRepository.insertMany(userAuthorshipPayload);
    await session.commitTransaction();
    await session.endSession();

    return {
      inserted,
      omitted,
    };
  }
}

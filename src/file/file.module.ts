import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [AuthModule],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}

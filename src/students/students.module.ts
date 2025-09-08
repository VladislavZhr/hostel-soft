// src/students/students.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentRepository } from './students.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, StudentRepository],
  exports: [
    StudentsService,
    StudentRepository,
  ],
})
export class StudentsModule {}

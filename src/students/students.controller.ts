// src/students/students.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { StudentsService } from './service/students.service';
import { ImportStudentService } from './service/importStudentService.service';

import { CreateStudentDto } from './dto/request/create-student.dto';
import { UpdateStudentDto } from './dto/request/UpdateStudentDto';

import { StudentDto } from './dto/responses/student.dto';
import { CreateStudentResponseDto } from './dto/responses/create-student.response';
import { UpdateStudentResponseDto } from './dto/responses/update-student.response';
import { DeleteStudentResponseDto } from './dto/responses/delete-student.response';
import { ImportReportDto } from './dto/responses/import-report.dto';

function excelFileFilter(_req: any, file: Express.Multer.File, cb: Function) {
  const ok = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',
    'text/csv',
  ].includes(file.mimetype);
  cb(ok ? null : new Error('Only .xlsx/.csv files are allowed'), ok);
}

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studService: StudentsService,
    private readonly importService: ImportStudentService,
  ) {}

  // === Create ===
  @Post('add')
  @ApiOperation({
    summary: 'Створити студента',
    description:
      'Додає нового студента. Поля повинні бути унікальні разом (ПІБ, кімната, факультет, курс, група).',
  })
  @ApiCreatedResponse({
    description: 'Створений студент',
    type: CreateStudentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Валідаційна помилка або дублікати' })
  async addNewStudent(@Body() dto: CreateStudentDto): Promise<CreateStudentResponseDto> {
    const newStudent = await this.studService.addNewStudent(dto);
    return { message: 'Student created', data: newStudent as unknown as StudentDto };
  }

  // === Read all ===
  @Get('get-all')
  @ApiOperation({ summary: 'Отримати всіх студентів' })
  @ApiOkResponse({
    description: 'Масив студентів',
    type: StudentDto,
    isArray: true,
  })
  getAllStudents(): Promise<StudentDto[]> {
    return this.studService.getAllStudents() as unknown as Promise<StudentDto[]>;
  }

  // === Read by id ===
  @Get(':id')
  @ApiOperation({ summary: 'Отримати студента за ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Студент', type: StudentDto })
  get(@Param('id', ParseIntPipe) id: number): Promise<StudentDto> {
    return this.studService.getStudentById(id) as unknown as Promise<StudentDto>;
  }

  // === Update ===
  @Patch(':id')
  @ApiOperation({ summary: 'Оновити дані студента' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Оновлений студент',
    type: UpdateStudentResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ): Promise<UpdateStudentResponseDto> {
    const updated = await this.studService.updateStudent(id, dto);
    return {
      message: `Student with id ${id} updated successfully.`,
      data: updated as unknown as StudentDto,
    };
  }

  // === Delete ===
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Видалити студента' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Підтвердження видалення',
    type: DeleteStudentResponseDto,
  })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<DeleteStudentResponseDto> {
    const deletedId = await this.studService.deleteStudent(id);
    return { message: `Student with id ${deletedId} deleted successfully.` };
  }

  // === Import from file ===
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: excelFileFilter,
    }),
  )
  @ApiOperation({
    summary: 'Імпорт студентів з файлу (.xlsx/.csv)',
    description:
      'Приймає таблицю з полями: fullName, roomNumber, faculty, course, studyGroup. Повертає звіт імпорту.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл Excel/CSV з переліком студентів',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Звіт імпорту',
    type: ImportReportDto,
  })
  @ApiBadRequestResponse({ description: 'Неприпустимий тип файлу або помилка імпорту' })
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportReportDto> {
    const report = await this.importService.importStudentsFromFile(file);
    // очікуємо, що сервіс повертає { processed, created, updated, skipped, errors? }
    return { message: 'Import finished', ...report };
  }
}

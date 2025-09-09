import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe, Patch,
  Post, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { StudentsService } from './service/students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/UpdateStudentDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportStudentService } from './service/importStudentService.service';


function excelFileFilter(_req: any, file: Express.Multer.File, cb: Function) {
  const ok = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',
    'text/csv',
  ].includes(file.mimetype);
  cb(ok ? null : new Error('Only .xlsx/.csv files are allowed'), ok);
}


// @ts-ignore
@Controller('students')
export class StudentsController {

  constructor(private readonly studService: StudentsService,
              private readonly importService: ImportStudentService){}

  @Post('add')
  async addNewStudent(@Body() dto: CreateStudentDto): Promise<{message: string; data: Student}> {
    const newStudent = await this.studService.addNewStudent(dto);
    return { message: 'Student created', data: newStudent };
  }

  @Get('get-all')
  getAllStudents(): Promise<Student[]> {
    return this.studService.getAllStudents();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deletedId = await this.studService.deleteStudent(id); // сервіс повертає id
    return { message: `Student with id ${deletedId} deleted successfully.` };
  }

  @Get(':id')
  get(@Param ('id', ParseIntPipe) id: number): Promise<Student> {
    return this.studService.getStudentById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ): Promise<{ message: string, data: Student }> {
    const update = await this.studService.updateStudent(id, dto);
    return { message: `Student with id ${id} updated successfully.`, data: update };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: excelFileFilter,
  }))
  @HttpCode(HttpStatus.OK)
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    const report = await this.importService.importStudentsFromFile(file);
    return { message: 'Import finished', ...report };
  }

}

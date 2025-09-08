import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe, Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/UpdateStudentDto';

// @ts-ignore
@Controller('students')
export class StudentsController {

  constructor(private readonly studService: StudentsService){}

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

}

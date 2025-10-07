import { BadRequestException, Injectable, NotFoundException, ValidationError } from '@nestjs/common';
import { StudentRepository } from '../students.repository';
import { CreateStudentDto } from '../dto/request/create-student.dto';
import { Student } from '../entities/student.entity';
import { UpdateStudentDto } from '../dto/request/UpdateStudentDto';
import {
  DuplicateStudentException,
  DuplicateStudentValue,
  EmptyPATCHRequest,
  EntityNotFoundException,
} from '../../common/errors/exceptions';


@Injectable()
export class StudentsService {

  constructor(private readonly studRepository: StudentRepository,) {}

  async addNewStudent(dto: CreateStudentDto): Promise<Student> {
    const normalDto = this.normalize(dto);
    const valid = await this.isUnique(normalDto);
    if(valid) {
      const student = await this.studRepository.createStudent(normalDto);
      return this.studRepository.save(student);
    } else throw new DuplicateStudentException();
  }

  //Метод перевіряє наявінсть дублів в бд по збіжністі студента по всім полям з іншим студентом, аналог equals() у Java
  async isUnique(dto: CreateStudentDto): Promise<boolean> {
    const exist = await this.studRepository.existsExact(dto);
    return !exist;
  }

  async checkExistingStudent(id: number): Promise<Student> {
    const existStudent = await this.studRepository.findStudentById(id);
    if (existStudent) return existStudent;
    else throw new EntityNotFoundException(`Student with id ${id}`);
  }

  async deleteStudent(id: number): Promise<number> {
    const existStudent = await this.checkExistingStudent(id);
    await this.studRepository.deleteStudentById(existStudent.id);
    return existStudent.id;
  }

  getStudentById(id: number): Promise<Student> {
    return this.checkExistingStudent(id);
  }

  getAllStudents(): Promise<Student[]> {
    return this.studRepository.findAll();
  }
  //Тут одразу йде валідація на те, щоб не можна було оновити однакові значення
  async updateStudent(id: number, dto: UpdateStudentDto): Promise<Student> {
    const current = await this.checkExistingStudent(id);
    const patch = this.normalize(dto);
    const keys = (Object.keys(patch) as (keyof UpdateStudentDto)[])
      .filter(k => patch[k] !== undefined);
    if (keys.length === 0) throw new EmptyPATCHRequest();
    const noActualChanges = keys.every(k => (current as any)[k] === (patch as any)[k]);
    if (noActualChanges) {
      throw new DuplicateStudentValue('Значення полів вже встановлені — оновлення не потрібне.');
    }
    return this.studRepository.updatePartialPreload(id, patch);
  }

  private normalize<T extends Partial<Student>>(dto: T): T {
    const trim = (s: string) => s.trim().replace(/\s+/g, ' ');
    return {
      ...dto,
      fullName:   dto.fullName   !== undefined ? trim(dto.fullName)     : undefined,
      roomNumber: dto.roomNumber !== undefined ? trim(dto.roomNumber)   : undefined,
      faculty:    dto.faculty    !== undefined ? trim(dto.faculty)      : undefined,
      studyGroup: dto.studyGroup !== undefined ? trim(dto.studyGroup)   : undefined,
    } as T;
  }
}

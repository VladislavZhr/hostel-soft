import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { Repository, DeepPartial } from 'typeorm';

type StudentPreloadPatch = Omit<DeepPartial<Student>, 'id'>;          // для preload

@Injectable()
export class StudentRepository {

  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  save(student: Student): Promise<Student> {
    return this.repo.save(student);
  }

  async createStudent(dto: CreateStudentDto): Promise<Student> {
    return this.repo.create(dto);
  }

  existsExact(d: Pick<Student, 'fullName'|'roomNumber'|'faculty'|'course'|'studyGroup'>): Promise<boolean> {
    return this.repo.existsBy({
      fullName: d.fullName,
      roomNumber: d.roomNumber,
      faculty: d.faculty,
      course: d.course,
      studyGroup: d.studyGroup,
    });
  }

  findAll(): Promise<Student[]> {
    return this.repo.find();
  }

  async updatePartialPreload(
    id: number,
    patch: StudentPreloadPatch,
  ): Promise<Student> {
    const merged = await this.repo.preload({ id, ...patch });
    if (!merged) throw new NotFoundException('Student not found')
    return this.repo.save(merged);
  }

  async deleteStudentById(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  findStudentById(id: number) {
    return this.repo.findOne({
      where: { id },
    })
  }





}

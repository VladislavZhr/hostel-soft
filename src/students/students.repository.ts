import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/request/create-student.dto';
import { Repository, DeepPartial, EntityManager, DataSource } from 'typeorm';
import { EntityNotFoundException } from '../common/errors/exceptions';

type StudentPreloadPatch = Omit<DeepPartial<Student>, 'id'>;          // для preload

@Injectable()
export class StudentRepository {

  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
    private readonly dataSource: DataSource,
  ) {}

  /** Отримати екземпляр, прив’язаний до транзакції */
  withManager(manager: EntityManager): StudentRepository {
    return new StudentRepository(manager.getRepository(Student), this.dataSource);
  }

  save(student: Student): Promise<Student> {
    return this.repo.save(student);
  }

  async createStudent(dto: CreateStudentDto): Promise<Student> {
    return this.repo.create(dto);
  }

  async mustExist(id: string | number): Promise<Student> {
    const sid = typeof id === 'string' ? Number(id) : id;
    if (Number.isNaN(sid)) throw new EntityNotFoundException('Invalid studentId');
    const s = await this.findStudentById(sid);
    if (!s) throw new EntityNotFoundException('Student');
    return s;
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
    if (!merged) throw new EntityNotFoundException('Student')
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

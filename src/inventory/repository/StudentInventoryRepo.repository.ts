
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Equal,
  IsNull,
  Repository,
} from 'typeorm';
import { StudentInventory } from '../entities/student-inventory.entity';
import { InventoryKind } from '../entities/InventoryKind';
import { Student } from '../../students/entities/student.entity';

@Injectable()
export class StudentInventoryRepository {
  constructor(
    @InjectRepository(StudentInventory)
    private readonly repo: Repository<StudentInventory>,
    private readonly dataSource: DataSource,
  ) {}

  /** Отримати екземпляр, прив’язаний до транзакції */
  withManager(manager: EntityManager): StudentInventoryRepository {
    return new StudentInventoryRepository(
      manager.getRepository(StudentInventory),
      this.dataSource,
    );
  }

  async listActiveAssignmentsFlat(): Promise<Array<{
    studentId: number;
    fullName: string;
    roomNumber: string;
    faculty: string;
    studyGroup: string;
    kind: InventoryKind;
    quantity: number;
  }>> {
    const qb = this.repo
      .createQueryBuilder('a')
      .innerJoin('a.student', 's')
      .select('s.id', 'studentId')
      .addSelect('s.fullName', 'fullName')
      .addSelect('s.roomNumber', 'roomNumber')
      .addSelect('s.faculty', 'faculty')
      .addSelect('s.studyGroup', 'studyGroup')
      .addSelect('a.kind', 'kind')
      .addSelect('COALESCE(SUM(a.quantity), 0)', 'quantity')
      .where('a.returnedAt IS NULL')
      .groupBy('s.id')
      .addGroupBy('s.fullName')
      .addGroupBy('s.roomNumber')
      .addGroupBy('s.faculty')
      .addGroupBy('s.studyGroup')
      .addGroupBy('a.kind')
      .orderBy('s.fullName', 'ASC');

    const rows = await qb.getRawMany<{
      studentId: string;
      fullName: string;
      roomNumber: string;
      faculty: string;
      studyGroup: string;
      kind: InventoryKind;
      quantity: string;
    }>();

    return rows.map(r => ({
      studentId: Number(r.studentId),
      fullName: r.fullName,
      roomNumber: r.roomNumber,
      faculty: r.faculty,
      studyGroup: r.studyGroup,
      kind: r.kind,
      quantity: Number(r.quantity),
    }));
  }

  // ====== CRUD-хелпери ======
  create(dto: Partial<StudentInventory>): StudentInventory {
    return this.repo.create(dto);
  }
  save(entity: StudentInventory): Promise<StudentInventory> {
    return this.repo.save(entity);
  }

  // ====== Запити, потрібні сервісу інвентарю ======

  /** Активний запис для (studentId, kind) */
  async findActiveByStudentAndKind(
    studentId: string | number,
    kind: InventoryKind,
  ): Promise<StudentInventory | null> {
    const sid = typeof studentId === 'string' ? Number(studentId) : studentId;
    return this.repo.findOne({
      where: {
        student: { id: Equal(sid as number) },
        kind,
        returnedAt: IsNull(),
      },
      relations: { student: true },
    });
  }

  /** Активні позиції конкретного студента (для списку) */
  async findActiveByStudent(
    studentId: string | number,
  ): Promise<StudentInventory[]> {
    const sid = typeof studentId === 'string' ? Number(studentId) : studentId;
    return this.repo.find({
      where: { student: { id: Equal(sid as number) }, returnedAt: IsNull() },
      relations: { student: true },
      order: { issuedAt: 'DESC' },
    });
  }

  /** Скільки одиниць виду зараз “на руках” загалом */
  async getActiveQtyByKind(kind: InventoryKind): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.quantity),0)', 'qty')
      .where('a.kind = :kind', { kind })
      .andWhere('a.returnedAt IS NULL')
      .getRawOne<{ qty: string }>();
    return Number(row?.qty ?? 0);
  }

  /** Активні кількості по всіх видах (для listStock) */
  async getActiveQtyGrouped(): Promise<Array<{ kind: InventoryKind; qty: number }>> {
    const rows = await this.repo
      .createQueryBuilder('a')
      .select('a.kind', 'kind')
      .addSelect('COALESCE(SUM(a.quantity),0)', 'qty')
      .where('a.returnedAt IS NULL')
      .groupBy('a.kind')
      .getRawMany<{ kind: InventoryKind; qty: string }>();
    return rows.map(r => ({ kind: r.kind, qty: Number(r.qty) }));
  }

  // ====== Операції видачі/повернення (інкапсульована логіка записів) ======

  /**
   * Додати (видати) студенту N одиниць виду.
   * Не створює студент/склад — лише працює з таблицею видач.
   * Якщо активний запис існує — інкрементує quantity; інакше створює новий active.
   */
  async incrementForStudent(
    student: Student,                // ПЕРЕДАЄМО сущність або getRef()
    kind: InventoryKind,
    plusQty: number,
  ): Promise<StudentInventory> {
    const active = await this.findActiveByStudentAndKind(student.id, kind);
    if (active) {
      active.quantity += plusQty;
      return this.save(active);
    }
    const created = this.create({
      student,
      kind,
      quantity: plusQty,
      returnedAt: null,
    });
    return this.save(created);
  }

  /**
   * Повернення від студента: якщо qty не задано або >= active.quantity — закриває запис;
   * інакше — зменшує кількість.
   * Повертає або оновлений запис, або `{ closed: true }`.
   */
  async returnForStudent(
    studentId: string | number,
    kind: InventoryKind,
    qty?: number | null,
  ): Promise<StudentInventory | { closed: true }> {
    const active = await this.findActiveByStudentAndKind(studentId, kind);
    if (!active) throw new Error('Active assignment not found');

    if (!qty || qty >= active.quantity) {
      active.returnedAt = new Date();
      await this.save(active);
      return { closed: true };
    } else {
      active.quantity -= qty;
      return this.save(active);
    }
  }
}

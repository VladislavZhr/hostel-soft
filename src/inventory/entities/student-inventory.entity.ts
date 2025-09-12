import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { InventoryKind } from './InventoryKind';

@Entity('student_inventory')
export class StudentInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Student, (s) => s.student_inventory, { onDelete: 'CASCADE', nullable: false })
  @Index()
  student!: Student;

  @Column({ type: 'enum', enum: InventoryKind })
  kind!: InventoryKind;

  @Column({ type: 'int' })
  quantity!: number;

  @CreateDateColumn()
  issuedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt!: Date | null;

}

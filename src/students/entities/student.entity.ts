import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({name: 'students'})
@Unique('UQ_student_full_eq', ['fullName','roomNumber','faculty','course','studyGroup'])
export class Student {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({type: 'varchar', length: 255})
  fullName!: string;

  @Column({type: 'varchar', length: 10})
  roomNumber!: string;

  @Column({type: 'varchar', length: 50})
  faculty!: string;

  @Column({type: 'int'})
  course!: number;

  @Column({type: 'varchar',length: 50})
  studyGroup!: string;

}

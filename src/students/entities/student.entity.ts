import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'students'})
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

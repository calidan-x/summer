import { Entity, Index, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
@Index()
export class Person {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  isActive: boolean = true
}

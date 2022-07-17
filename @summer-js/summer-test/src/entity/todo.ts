import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ comment: '内容' })
  content: string

  @Column()
  isDone: boolean
}

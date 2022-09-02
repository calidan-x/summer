import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ comment: 'Movie Name' })
  name: string

  @Column({ comment: 'Movie Year' })
  year: string
}

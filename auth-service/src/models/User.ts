import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 30, nullable: true })
  firstName: string;

  @Column({ length: 30, nullable: true })
  lastName: string;

  @Column({ length: 30, nullable: true })
  avatar: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

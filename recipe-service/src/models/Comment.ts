import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
// import { User } from "./User";
import { Recipe } from "./Recipe";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  text: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  date: Date;

  @Column()
  userId: number;

  @ManyToOne(() => Recipe, recipe => recipe.comments, { onDelete: "CASCADE" })
  recipe: Recipe;
}

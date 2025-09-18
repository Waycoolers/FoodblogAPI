import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,  } from "typeorm";
// import { User } from "./User";
import { Recipe } from "./Recipe";

@Entity()
export class UserRecipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isAuthor: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => Recipe, recipe => recipe.savedByUsers, { onDelete: "CASCADE" })
  recipe: Recipe;
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RecipeCategory } from "./RecipeCategory";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  name: string;

  @OneToMany(() => RecipeCategory, recipeCategory => recipeCategory.category)
  recipes: RecipeCategory[];

}

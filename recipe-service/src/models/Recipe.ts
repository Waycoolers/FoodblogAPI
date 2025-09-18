import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
// import { User } from "./User";
import { Comment } from "./Comment";
import { RecipeIngredient } from "./RecipeIngredient";
import { RecipeCategory } from "./RecipeCategory";
import { UserRecipe } from "./UserRecipe";

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  photo: string;

  @Column({length: 1000, nullable: true})
  description: string;

  @CreateDateColumn()
  date: Date;

  @Column({ default: 1 })
  difficulty: number;

  @Column("text")
  recipeText: string;

  @Column({ default: 0 })
  likes: number;

  @Column()
  authorId: number;

  @OneToMany(() => Comment, comment => comment.recipe)
  comments: Comment[];

  @OneToMany(() => RecipeIngredient, recipeIngredient => recipeIngredient.recipe)
  ingredients: RecipeIngredient[];

  @OneToMany(() => RecipeCategory, recipeCategory => recipeCategory.recipe)
  categories: RecipeCategory[];

  @OneToMany(() => UserRecipe, userRecipe => userRecipe.recipe)
  savedByUsers: UserRecipe[];
}

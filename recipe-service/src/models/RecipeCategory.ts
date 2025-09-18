import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Recipe } from "./Recipe";
import { Category } from "./Category";

@Entity()
export class RecipeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recipe, recipe => recipe.categories, { onDelete: "CASCADE" })
  recipe: Recipe;

  @ManyToOne(() => Category, category => category.recipes, { onDelete: "CASCADE" })
  category: Category;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Recipe } from "./Recipe";
import { Ingredient } from "./Ingredient";
import { ValueType } from "./ValueType";

@Entity()
export class RecipeIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("float")
  value: number;

  @ManyToOne(() => Recipe, recipe => recipe.ingredients, { onDelete: "CASCADE" })
  recipe: Recipe;

  @ManyToOne(() => Ingredient, ingredient => ingredient.recipes, { onDelete: "CASCADE" })
  ingredient: Ingredient;

  @ManyToOne(() => ValueType, valueType => valueType.id)
  valueType: ValueType;
}

import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./config/database";
import { setupSwagger } from "./config/swagger";
import { extractUserFromHeaders } from "./middleware/middleware";

import * as path from "path";
import * as dotenv from "dotenv";

import ingredientRoutes from "./routes/ingredientRoutes"
import valueTypeRoutes from "./routes/valueTypeRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import recipeCategoryRoutes from "./routes/recipeCategoryRoutes"
import recipeIngredientRoutes from "./routes/recipeIngredientRoutes"
import recipeRoutes from "./routes/recipeRoutes"
import commentRoutes from "./routes/commentRoutes"
import userRecipeRoutes from "./routes/userRecipeRoutes"
import userCabinetRouter from "./routes/userCabinetRouter";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3000;
setupSwagger(app);

app.use(express.json());
app.use(extractUserFromHeaders);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

app.use("/ingredients", ingredientRoutes);
app.use("/vt", valueTypeRoutes);
app.use("/categories", categoryRoutes);
app.use("/rc", recipeCategoryRoutes);
app.use("/ri", recipeIngredientRoutes);
app.use("/recipes", recipeRoutes);
app.use("/comments", commentRoutes);
app.use("/ur", userRecipeRoutes);

app.use("/cabinet", userCabinetRouter);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

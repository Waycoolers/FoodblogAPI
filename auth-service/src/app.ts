import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./config/database";
import { setupSwagger } from "./config/swagger";
import { connectRabbitMQ } from './rabbit/server';

import userRoutes from "./routes/userRoutes"
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3000;
setupSwagger(app);
connectRabbitMQ().then(() => {
    console.log('RabbitMQ client initialized');
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Auth server is running!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Error during Data Source initialization:", err);
  });

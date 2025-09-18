import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./config/database";
import { setupSwagger } from "./config/swagger";
import { connectRabbitMQ } from './rabbit/client';

import userSubscriptionsRoutes from "./routes/userSubscriptionsRoutes"
import { extractUserFromHeaders } from "./middleware/middleware";

const app = express();
const PORT = process.env.PORT || 3000;
setupSwagger(app);
connectRabbitMQ().then(() => {
    console.log('RabbitMQ client initialized');
});

app.use(express.json());
app.use(extractUserFromHeaders);

app.get("/", (req: Request, res: Response) => {
  res.send("Subscription server is running!");
});

app.use("/us", userSubscriptionsRoutes);

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

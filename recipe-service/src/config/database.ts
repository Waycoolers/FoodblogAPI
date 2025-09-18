import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { entities } from "../models"; // <- подключаем агрегатор

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "foodblog",
  synchronize: false, // для миграций всегда false
  logging: true,
  entities: entities,
  migrations: ["src/migrations/*.{ts,js}"],
});

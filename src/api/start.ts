import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "./server";
import { env } from "./env";

const api = express();
api.use(cors());
api.use(morgan("dev"));
api.use(createServer());

api.listen(env.apiPort, () => {
  console.log(`API server is listening on localhost:${env.apiPort}`);
});

import express from "express";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "./server";
import { env } from "./env";

const devServer = express();
devServer.use(cors());
devServer.use(morgan("dev"));
devServer.use(createServer());

devServer.listen(env.API_PORT, () => {
  console.log(
    `API dev server is listening on http://localhost:${env.API_PORT}`
  );
});

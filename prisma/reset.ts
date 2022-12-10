import type { DatabaseClient } from "../src/api/db";
import { createDatabaseClient } from "../src/api/db";
import { seed, withClient } from "./seed";

async function reset(modelNames?: string[]) {
  await withClient(createDatabaseClient(), async (client) => {
    await deleteAll(client, modelNames);
    await seed(client);
  });
}

function deleteAll(client: DatabaseClient, modelNames?: string[]) {
  if (!modelNames) {
    modelNames = Object.keys(client).filter((key) => isModel(client[key]));
  }
  return client.$transaction(
    modelNames.map((modelName) => client[modelName].deleteMany())
  );
}

function isModel(value: unknown) {
  return typeof value === "object" && "deleteMany" in value;
}

if (require.main === module) {
  const modelName = process.argv[2]?.trim();
  reset(modelName ? modelName.split(",").map((s) => s.trim()) : undefined);
}

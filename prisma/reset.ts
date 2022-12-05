import { createDatabaseClient } from "../src/api/db";
import { seed } from "./seed";

export async function reset(modelNames?: string[]) {
  const client = createDatabaseClient();
  if (!modelNames) {
    modelNames = Object.keys(client).filter((key) => isModel(client[key]));
  }
  try {
    for (const modelName of modelNames) {
      console.log(`Deleting all entries for model "${modelName}"`);
      await client[modelName].deleteMany({});
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }

  await seed(client);
}

function isModel(value: unknown) {
  return typeof value === "object" && "deleteMany" in value;
}

if (require.main === module) {
  const modelName = process.argv[2]?.trim();
  reset(modelName ? modelName.split(",").map((s) => s.trim()) : undefined);
}

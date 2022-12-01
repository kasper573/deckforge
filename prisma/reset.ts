import { createDatabaseClient } from "../src/api/db";
import { seed } from "./seed";

export async function reset() {
  const client = createDatabaseClient();
  try {
    for (const model of Object.values(client).filter(isModel)) {
      await model.deleteMany({});
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
  reset();
}

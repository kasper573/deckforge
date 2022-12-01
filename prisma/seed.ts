import { createDatabaseClient } from "../src/api/db";

export async function seed(client = createDatabaseClient()) {
  const id = "cl9ebqhxk00003b600tymydho";
  try {
    await client.example.upsert({
      where: {
        id,
      },
      create: {
        id,
      },
      update: {},
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

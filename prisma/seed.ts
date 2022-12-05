import { createDatabaseClient } from "../src/api/db";

export async function seed(client = createDatabaseClient()) {
  try {
    // NOTE: this can be removed when real seeds are added
    client.user.create({
      data: { email: "seed@seed.com", passwordHash: "1234", name: "seed" },
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

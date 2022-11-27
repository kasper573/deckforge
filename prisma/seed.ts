import { createPrismaClient } from "../src/api/prisma";

async function main() {
  const id = "cl9ebqhxk00003b600tymydho";
  const client = createPrismaClient();
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

main();

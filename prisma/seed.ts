import { createPrismaClient } from "../src/api/prisma";

async function main() {
  const id = "cl9ebqhxk00003b600tymydho";
  const client = createPrismaClient();
  await client.example.upsert({
    where: {
      id,
    },
    create: {
      id,
    },
    update: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

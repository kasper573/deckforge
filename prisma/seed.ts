import { prisma } from "../src/server/db/client";

async function main() {
  const id = "cl9ebqhxk00003b600tymydho";
  await prisma.example.upsert({
    where: {
      id,
    },
    create: {
      id,
    },
    update: {},
  });
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

import type { DatabaseClient } from "../src/api/db";
import { createDatabaseClient } from "../src/api/db";
import { createAuthenticator } from "../src/api/services/user/authenticator";
import { env } from "../src/api/env";
import { roleToAccessLevel } from "../src/api/services/user/types";

export async function seed(
  client: DatabaseClient,
  { createPasswordHash } = createAuthenticator()
) {
  if (!env.seed) {
    return;
  }
  const { name, email, password } = env.seed.adminUser;
  const userData = {
    accessLevel: roleToAccessLevel("Admin"),
    name,
    email,
    passwordHash: await createPasswordHash(password),
  };
  await client.user.upsert({
    update: userData,
    create: userData,
    where: { email },
  });
}

export async function withClient(
  client: DatabaseClient,
  fn: (client: DatabaseClient) => void | Promise<unknown>
) {
  try {
    await fn(client);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
}

if (require.main === module) {
  withClient(createDatabaseClient(), seed);
}

import { createDatabaseClient } from "../src/api/db";
import { createAuthenticator } from "../src/api/services/user/authenticator";
import { env } from "../src/api/env";
import { roleToAccessLevel } from "../src/api/services/user/types";

export async function seed(
  client = createDatabaseClient(),
  { createPasswordHash } = createAuthenticator()
) {
  try {
    if (env.seed) {
      const { name, email, password } = env.seed.adminUser;
      await client.user.create({
        data: {
          accessLevel: roleToAccessLevel("Admin"),
          name,
          email,
          passwordHash: await createPasswordHash(password),
        },
      });
    }
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

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const displayName = process.env.SEED_ADMIN_DISPLAY_NAME || "管理员";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash, displayName, role: "EDITOR" },
    update: { passwordHash, role: "EDITOR", displayName },
  });

  console.log(`Admin user ready: ${user.username} (role=${user.role})`);
  console.log(`  default password: ${password}  ← 请尽快登录后修改密码`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

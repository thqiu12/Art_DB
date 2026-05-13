import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const byNonStudy = await prisma.program.groupBy({
    by: ["acceptsNonStudyVisa"],
    _count: true,
  });
  console.log("非留学签证 分布:");
  byNonStudy.forEach((g) =>
    console.log(`  ${JSON.stringify(g.acceptsNonStudyVisa)} → ${g._count}`),
  );

  const byRequiresJp = await prisma.program.groupBy({
    by: ["requiresJp"],
    _count: true,
  });
  console.log("\n日语要求 分布:");
  byRequiresJp.forEach((g) =>
    console.log(`  ${JSON.stringify(g.requiresJp)} → ${g._count}`),
  );

  const passable = await prisma.program.count({
    where: {
      acceptsJpHs: "可",
      acceptsNonStudyVisa: "可",
      requiresJp: "不需要",
    },
  });
  console.log(`\n应该可报考(日高+非留学+不要日语) 的项目数: ${passable}`);

  await prisma.$disconnect();
}
main().catch(console.error);

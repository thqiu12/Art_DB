import { unstable_cache } from "next/cache";
import { prisma } from "./db";

// 全部 program (含学校信息),缓存 60 秒。
// 编辑相关 server-actions 会 updateTag("programs") 立刻失效。
export const getAllPrograms = unstable_cache(
  async () =>
    prisma.program.findMany({
      include: { school: { select: { id: true, name: true, active: true } } },
      orderBy: [{ school: { name: "asc" } }, { admissionMethod: "asc" }],
    }),
  ["all-programs"],
  { revalidate: 60, tags: ["programs"] },
);

export const getAllSchools = unstable_cache(
  async () =>
    prisma.school.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { programs: true } } },
    }),
  ["all-schools"],
  { revalidate: 60, tags: ["programs"] },
);

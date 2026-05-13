import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import FilterDashboard from "./FilterDashboard";

// 缓存 60 秒,并打 tag。编辑/新建/删除时 server-actions 调 revalidateTag("programs") 立即失效。
const getPrograms = unstable_cache(
  async () =>
    prisma.program.findMany({
      include: { school: { select: { name: true, active: true } } },
      orderBy: [{ school: { name: "asc" } }, { admissionMethod: "asc" }],
    }),
  ["all-programs"],
  { revalidate: 60, tags: ["programs"] },
);

export default async function DashboardPage() {
  const programs = await getPrograms();
  const rows = programs.map((p) => ({
    id: p.id,
    schoolName: p.school.name,
    schoolActive: p.school.active,
    admissionMethod: p.admissionMethod,
    scheduleType: p.scheduleType,
    acceptsJpHs: p.acceptsJpHs,
    acceptsOverseasNonStudy: p.acceptsOverseasNonStudy,
    acceptsStudyVisa: p.acceptsStudyVisa,
    acceptsNonStudyVisa: p.acceptsNonStudyVisa,
    requiresJp: p.requiresJp,
    jpRequirement: p.jpRequirement,
    jpExemption: p.jpExemption,
    attendanceMin: p.attendanceMin,
    remarks: p.remarks,
    yearTag: p.yearTag,
  }));
  return <FilterDashboard rows={rows} />;
}

import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import path from "node:path";

const prisma = new PrismaClient();

type Row = Record<string, unknown>;

function s(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\s+\n\s+/g, "\n").trim();
}

function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

async function main() {
  const file =
    process.env.IMPORT_XLSX_PATH ||
    path.resolve(
      process.cwd(),
      "../7. 🏋️日高生＋海外高中非留学签证报考条件筛选表.xlsx",
    );
  console.log(`Reading: ${file}`);
  const wb = XLSX.readFile(file);

  // 主表
  const mainSheet = wb.Sheets["主表"];
  if (!mainSheet) throw new Error("Sheet 「主表」 not found");
  const rows = XLSX.utils.sheet_to_json<Row>(mainSheet, { defval: "" });

  // 學校 list
  const listSheet = wb.Sheets["學校list"];
  const listRows = listSheet
    ? XLSX.utils.sheet_to_json<Row>(listSheet, { defval: "", header: 1 })
    : [];
  const activeSchoolNames = new Set<string>();
  for (const r of listRows as unknown as unknown[][]) {
    const name = s(r[0]);
    const tick = s(r[1]);
    if (name && tick) activeSchoolNames.add(name);
  }

  await prisma.program.deleteMany();
  await prisma.school.deleteMany();

  const schoolCache = new Map<string, string>();
  let programCount = 0;

  for (const row of rows) {
    const schoolName = s(row["学校名称"]);
    if (!schoolName) continue;
    const admissionMethod = s(row["选拔方式"]);
    if (!admissionMethod) continue;

    let schoolId = schoolCache.get(schoolName);
    if (!schoolId) {
      const sc = await prisma.school.upsert({
        where: { name: schoolName },
        create: {
          name: schoolName,
          active: activeSchoolNames.size === 0 || activeSchoolNames.has(schoolName),
        },
        update: {},
      });
      schoolId = sc.id;
      schoolCache.set(schoolName, schoolId);
    }

    await prisma.program.create({
      data: {
        schoolId,
        admissionMethod,
        scheduleType: s(row["日程类型"]),
        acceptsJpHs: s(row["日高可否"]),
        acceptsOverseasNonStudy: s(row["海外高中\n非留学签证\n可否"]) || s(row["海外高中非留学签证可否"]),
        acceptsStudyVisa: s(row["是否接受\n留学签证"]) || s(row["是否接受留学签证"]),
        acceptsNonStudyVisa:
          s(row["是否接受\n非留学签证\n（定住/永住/家族）"]) ||
          s(row["是否接受非留学签证（定住/永住/家族）"]),
        requiresJp: s(row["是否要求\n日语证明"]) || s(row["是否要求日语证明"]),
        jpRequirement: s(row["日语\n要求"]) || s(row["日语要求"]) || null,
        jpExemption:
          s(row["日语免除条件\n（只有在H栏条件免除才填写）"]) ||
          s(row["日语免除条件"]) ||
          null,
        attendanceMin: num(row["出席率（%）"]),
        remarks: s(row["備註"]) || s(row["备注"]) || null,
        yearTag: s(row["檢查（思）"]) || s(row["检查"]) || null,
      },
    });
    programCount += 1;
  }

  console.log(`Imported ${schoolCache.size} schools, ${programCount} programs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

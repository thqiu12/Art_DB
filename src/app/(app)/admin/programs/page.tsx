import { prisma } from "@/lib/db";
import { deleteProgram } from "@/lib/server-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgramsPage(props: {
  searchParams: Promise<{ q?: string; school?: string }>;
}) {
  const sp = await props.searchParams;
  const q = sp.q?.trim() ?? "";
  const schoolId = sp.school?.trim() ?? "";

  const [programs, schools] = await Promise.all([
    prisma.program.findMany({
      where: {
        AND: [
          schoolId ? { schoolId } : {},
          q
            ? {
                OR: [
                  { admissionMethod: { contains: q } },
                  { school: { name: { contains: q } } },
                ],
              }
            : {},
        ],
      },
      include: { school: { select: { name: true } } },
      orderBy: [{ school: { name: "asc" } }, { admissionMethod: "asc" }],
    }),
    prisma.school.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">招生项目管理</h1>
        <Link href="/admin/programs/new" className="btn-primary">+ 新建项目</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3 items-center bg-white rounded-2xl border border-zinc-200 p-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索学校名 / 选拔方式…"
          className="select w-64"
        />
        <select name="school" defaultValue={schoolId} className="select w-48">
          <option value="">全部学校</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">筛选</button>
        <span className="text-xs text-zinc-500 ml-auto">共 {programs.length} 条</span>
      </form>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="text-left p-3">学校</th>
              <th className="text-left p-3">选拔方式</th>
              <th className="text-left p-3">日程</th>
              <th className="text-left p-3">日高/海外</th>
              <th className="text-left p-3">日语</th>
              <th className="text-left p-3">出席</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100">
                <td className="p-3">{p.school.name}</td>
                <td className="p-3 whitespace-pre-line">{p.admissionMethod}</td>
                <td className="p-3 text-xs text-zinc-600">{p.scheduleType}</td>
                <td className="p-3 text-xs text-zinc-600">
                  {p.acceptsJpHs}/{p.acceptsOverseasNonStudy}
                </td>
                <td className="p-3 text-xs text-zinc-600 max-w-[240px]">
                  {p.requiresJp}
                  {p.jpRequirement ? `: ${p.jpRequirement}` : ""}
                </td>
                <td className="p-3 text-xs">{p.attendanceMin || "—"}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/programs/${p.id}`} className="text-zinc-700 hover:text-black text-xs">编辑</Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteProgram(p.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-rose-700 hover:text-rose-900 text-xs"
                    >
                      删除
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {programs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400 text-sm">
                  无记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

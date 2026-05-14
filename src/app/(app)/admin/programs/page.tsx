import { deleteProgram } from "@/lib/server-actions";
import { getAllPrograms, getAllSchools } from "@/lib/data";
import Link from "next/link";

export default async function ProgramsPage(props: {
  searchParams: Promise<{ q?: string; school?: string }>;
}) {
  const sp = await props.searchParams;
  const q = sp.q?.trim() ?? "";
  const schoolId = sp.school?.trim() ?? "";

  const [allPrograms, schools] = await Promise.all([
    getAllPrograms(),
    getAllSchools(),
  ]);

  const programs = allPrograms.filter((p) => {
    if (schoolId && p.schoolId !== schoolId) return false;
    if (
      q &&
      !p.admissionMethod.includes(q) &&
      !p.school.name.includes(q)
    )
      return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">招生项目管理</h1>
        <Link href="/admin/programs/new" className="btn-primary">+ 新建项目</Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-3 items-center bg-white rounded-2xl border border-[#E2E0DA] p-3">
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
        <span className="text-xs text-[#BDBDBD] ml-auto">共 {programs.length} 条</span>
      </form>

      <div className="bg-white rounded-2xl border border-[#E2E0DA] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-[#BDBDBD] border-b border-[#E2E0DA]">
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
              <tr key={p.id} className="border-b border-[#F0EFE9]">
                <td className="p-3">{p.school.name}</td>
                <td className="p-3 whitespace-pre-line">{p.admissionMethod}</td>
                <td className="p-3 text-xs text-[#7A7A7A]">{p.scheduleType}</td>
                <td className="p-3 text-xs text-[#7A7A7A]">
                  {p.acceptsJpHs}/{p.acceptsOverseasNonStudy}
                </td>
                <td className="p-3 text-xs text-[#7A7A7A] max-w-[240px]">
                  {p.requiresJp}
                  {p.jpRequirement ? `: ${p.jpRequirement}` : ""}
                </td>
                <td className="p-3 text-xs">{p.attendanceMin || "—"}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/programs/${p.id}`} className="text-[#1C1C1C] hover:text-black text-xs">编辑</Link>
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
                <td colSpan={7} className="p-8 text-center text-[#BDBDBD] text-sm">
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

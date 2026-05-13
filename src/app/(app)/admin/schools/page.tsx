import { createSchool, deleteSchool, updateSchool } from "@/lib/server-actions";
import { getAllSchools } from "@/lib/data";

export default async function SchoolsPage() {
  const schools = await getAllSchools();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">学校管理</h1>
      </div>

      <form
        action={createSchool}
        className="bg-white rounded-2xl border border-zinc-200 p-4 flex gap-2 items-end"
      >
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-xs text-zinc-600">新增学校</span>
          <input name="name" required placeholder="学校名" className="select" />
        </label>
        <button type="submit" className="btn-primary">添加</button>
      </form>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="text-left p-3">学校名</th>
              <th className="text-left p-3">项目数</th>
              <th className="text-left p-3">启用</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100">
                <td className="p-2">
                  <form
                    action={async (fd: FormData) => {
                      "use server";
                      await updateSchool(s.id, fd);
                    }}
                    className="flex gap-2 items-center"
                  >
                    <input
                      name="name"
                      defaultValue={s.name}
                      className="select w-56"
                    />
                    {s.active ? (
                      <input type="hidden" name="active" value="on" />
                    ) : null}
                    <button type="submit" className="btn-secondary text-xs">
                      保存
                    </button>
                  </form>
                </td>
                <td className="p-3 text-xs text-zinc-500">{s._count.programs}</td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      const fd = new FormData();
                      fd.set("name", s.name);
                      if (!s.active) fd.set("active", "on");
                      await updateSchool(s.id, fd);
                    }}
                  >
                    <button
                      type="submit"
                      className={
                        "rounded-md px-2 py-1 text-xs " +
                        (s.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600")
                      }
                    >
                      {s.active ? "启用中" : "已停用"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await deleteSchool(s.id);
                    }}
                  >
                    <button type="submit" className="text-rose-700 hover:text-rose-900 text-xs">
                      删除
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">
        提示: 删除学校会连带删除其全部招生项目。
      </p>
    </div>
  );
}

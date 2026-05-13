import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createUser, deleteUser, updateUser } from "@/lib/server-actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);
  const meId = session?.user?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <h1 className="text-lg font-semibold">用户管理</h1>

      <form
        action={createUser}
        className="bg-white rounded-2xl border border-zinc-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-600">账号</span>
          <input name="username" required className="select" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-600">密码 (≥6 位)</span>
          <input
            name="password"
            type="text"
            required
            minLength={6}
            className="select"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-600">显示名</span>
          <input name="displayName" className="select" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-600">权限</span>
          <select name="role" defaultValue="VIEWER" className="select">
            <option value="VIEWER">查看者</option>
            <option value="EDITOR">编辑者</option>
          </select>
        </label>
        <button type="submit" className="btn-primary">添加用户</button>
      </form>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="text-left p-3">账号</th>
              <th className="text-left p-3">编辑 (显示名 / 权限 / 重置密码)</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100">
                <td className="p-3 font-mono text-xs">{u.username}</td>
                <td className="p-2">
                  <form
                    action={async (fd: FormData) => {
                      "use server";
                      await updateUser(u.id, fd);
                    }}
                    className="flex gap-2 items-center flex-wrap"
                  >
                    <input
                      name="displayName"
                      defaultValue={u.displayName ?? ""}
                      placeholder="显示名"
                      className="select w-40"
                    />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="select w-28"
                    >
                      <option value="VIEWER">查看者</option>
                      <option value="EDITOR">编辑者</option>
                    </select>
                    <input
                      name="password"
                      placeholder="留空不改密码"
                      className="select w-40"
                    />
                    <button type="submit" className="btn-secondary text-xs">
                      保存
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  {meId === u.id ? (
                    <span className="text-xs text-zinc-400">(当前账号)</span>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        await deleteUser(u.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-rose-700 hover:text-rose-900 text-xs"
                      >
                        删除
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

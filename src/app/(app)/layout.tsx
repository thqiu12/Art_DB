import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isEditor = session.user.role === "EDITOR";
  return (
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold text-sm">
              升学条件筛选数据库
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-700">
              <Link href="/dashboard" className="hover:text-black">筛选</Link>
              {isEditor && (
                <>
                  <Link href="/admin/programs" className="hover:text-black">招生项目</Link>
                  <Link href="/admin/schools" className="hover:text-black">学校</Link>
                  <Link href="/admin/users" className="hover:text-black">用户</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">
              {session.user.name}
              <span className="ml-2 rounded-md bg-zinc-100 px-2 py-0.5 text-xs">
                {isEditor ? "编辑者" : "查看者"}
              </span>
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-zinc-600 hover:text-black"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}

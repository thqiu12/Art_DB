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
      <header className="bg-white border-b border-[#E2E0DA] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5">
              <span className="font-black text-[#1C1C1C] text-lg tracking-tight">
                CHIART
              </span>
              <span className="text-[#BDBDBD] text-sm font-light">|</span>
              <span className="text-[#7A7A7A] text-sm hidden sm:inline">
                日高生升学规划
              </span>
            </Link>
            <nav className="ml-4 flex gap-3 text-sm">
              <NavLink href="/dashboard">筛选</NavLink>
              {isEditor && (
                <>
                  <NavLink href="/admin/programs">招生项目</NavLink>
                  <NavLink href="/admin/schools">学校</NavLink>
                  <NavLink href="/admin/users">用户</NavLink>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:flex items-center gap-2 text-[#7A7A7A]">
              {session.user.name}
              <span
                className={
                  "rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase " +
                  (isEditor
                    ? "bg-[#FFF8EE] text-[#F09517]"
                    : "bg-[#F5F4F0] text-[#7A7A7A]")
                }
              >
                {isEditor ? "Editor" : "Viewer"}
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
                className="text-xs border border-[#E2E0DA] px-3 py-1.5 rounded-lg hover:bg-[#F5F4F0] transition text-[#7A7A7A]"
              >
                退出
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="bg-[#1C1C1C] text-white">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <p className="text-[10px] font-black tracking-[0.25em] text-[#F09517] uppercase mb-1.5">
            ART IS LIMITLESS — 知日美术 升学支持
          </p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            日高生<span className="text-[#F09517]">升学规划数据库</span>
          </h1>
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E2E0DA] bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="font-black text-[#1C1C1C] tracking-tight">
              CHIART
            </span>
            <span className="text-[#BDBDBD] mx-2">|</span>
            <span className="text-xs text-[#BDBDBD]">
              知日美术 日高生升学规划数据库
            </span>
          </div>
          <p className="text-xs text-[#BDBDBD]">ART IS LIMITLESS</p>
        </div>
      </footer>
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[#1C1C1C] hover:text-[#F09517] transition font-medium"
    >
      {children}
    </Link>
  );
}

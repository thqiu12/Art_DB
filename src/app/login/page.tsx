import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage(props: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const sp = await props.searchParams;
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <h1 className="text-xl font-semibold mb-1">升学条件筛选数据库</h1>
        <p className="text-sm text-zinc-500 mb-6">请使用账号密码登录</p>
        <LoginForm from={sp.from} error={sp.error} />
      </div>
    </div>
  );
}

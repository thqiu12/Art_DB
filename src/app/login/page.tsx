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
    <div className="flex flex-1 items-center justify-center px-4 py-12 bg-[#F5F4F0]">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E2E0DA] p-8">
        <div className="flex items-center gap-1.5 mb-5">
          <span className="font-black text-[#1C1C1C] text-xl tracking-tight">
            CHIART
          </span>
          <span className="text-[#BDBDBD] text-sm font-light">|</span>
          <span className="text-[#7A7A7A] text-sm">知日美术</span>
        </div>
        <p className="text-[10px] font-black tracking-[0.25em] text-[#F09517] uppercase mb-1">
          ART IS LIMITLESS
        </p>
        <h1 className="text-xl font-black mb-1 text-[#1C1C1C]">
          日高生<span className="text-[#F09517]">升学规划数据库</span>
        </h1>
        <p className="text-sm text-[#7A7A7A] mb-6">请使用账号密码登录</p>
        <LoginForm from={sp.from} error={sp.error} />
      </div>
    </div>
  );
}

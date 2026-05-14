"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm({
  from,
  error,
}: {
  from?: string;
  error?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(
    error ? "登录失败,请检查账号密码" : null,
  );
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (res?.error) {
        setMsg("账号或密码错误");
        return;
      }
      router.replace(from || "/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-[#BDBDBD] uppercase">
          账号
        </span>
        <input
          className="select"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-[#BDBDBD] uppercase">
          密码
        </span>
        <input
          type="password"
          className="select"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {msg && <p className="text-sm text-rose-600">{msg}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-2 w-full py-2.5"
      >
        {pending ? "登录中…" : "登录"}
      </button>
    </form>
  );
}

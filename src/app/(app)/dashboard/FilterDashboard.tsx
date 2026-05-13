"use client";

import { useMemo, useState } from "react";
import { evaluate, type StudentCriteria } from "@/lib/eligibility";

export type Row = {
  id: string;
  schoolName: string;
  schoolActive: boolean;
  admissionMethod: string;
  scheduleType: string;
  acceptsJpHs: string;
  acceptsOverseasNonStudy: string;
  acceptsStudyVisa: string;
  acceptsNonStudyVisa: string;
  requiresJp: string;
  jpRequirement: string | null;
  jpExemption: string | null;
  attendanceMin: number;
  remarks: string | null;
  yearTag: string | null;
};

const VISA_OPTIONS = [
  "留学",
  "家族滞在",
  "定住",
  "永住",
  "日本人配偶",
  "永住者配偶",
  "定住者配偶",
];

const JP_LEVELS = [
  "无",
  "N5",
  "N4",
  "N3",
  "N2",
  "N1",
  "EJU 220+",
  "EJU 280+",
  "EJU 320+",
];

const FILTER_OPTIONS = [
  { v: "all", label: "全部" },
  { v: "pass", label: "仅可报考" },
  { v: "review", label: "仅需人工确认" },
  { v: "fail", label: "仅不可报考" },
] as const;

const DEFAULT_STUDENT: StudentCriteria = {
  background: "日本高中",
  isJpHs: true,
  jpHsYears: 3,
  nationality: "外国籍",
  visaStatus: "家族滞在",
  jpLevel: "无",
  attendance: 90,
};

export default function FilterDashboard({ rows }: { rows: Row[] }) {
  const [draftStudent, setDraftStudent] = useState<StudentCriteria>(DEFAULT_STUDENT);
  const [appliedStudent, setAppliedStudent] = useState<StudentCriteria>(DEFAULT_STUDENT);
  const isDirty = JSON.stringify(draftStudent) !== JSON.stringify(appliedStudent);
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]["v"]>("pass");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [scheduleType, setScheduleType] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  const scheduleTypes = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.scheduleType) s.add(r.scheduleType);
    return Array.from(s);
  }, [rows]);

  const evaluated = useMemo(() => {
    return rows.map((r) => ({ row: r, result: evaluate(appliedStudent, r) }));
  }, [rows, appliedStudent]);

  const filtered = useMemo(() => {
    return evaluated.filter(({ row, result }) => {
      if (!showInactive && !row.schoolActive) return false;
      if (schoolQuery && !row.schoolName.includes(schoolQuery)) return false;
      if (scheduleType !== "all" && row.scheduleType !== scheduleType) return false;
      if (filter === "pass") return result.overall === "可报考";
      if (filter === "fail") return result.overall === "不可报考";
      if (filter === "review") return result.overall === "需人工确认";
      return true;
    });
  }, [evaluated, filter, schoolQuery, scheduleType, showInactive]);

  const counts = useMemo(() => {
    const c = { pass: 0, review: 0, fail: 0 };
    for (const { result } of evaluated) {
      if (result.overall === "可报考") c.pass += 1;
      else if (result.overall === "需人工确认") c.review += 1;
      else c.fail += 1;
    }
    return c;
  }, [evaluated]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <aside className="bg-white rounded-2xl border border-zinc-200 p-5 self-start lg:sticky lg:top-4">
        <h2 className="text-sm font-semibold mb-4">学生条件</h2>
        <div className="flex flex-col gap-3">
          <Field label="出身">
            <select
              className="select"
              value={draftStudent.background}
              onChange={(e) =>
                setDraftStudent({
                  ...draftStudent,
                  background: e.target.value as StudentCriteria["background"],
                  isJpHs: e.target.value === "日本高中",
                })
              }
            >
              <option value="日本高中">日本高中</option>
              <option value="海外高中">海外高中</option>
            </select>
          </Field>
          <Field label="是否日高生">
            <select
              className="select"
              value={draftStudent.isJpHs ? "是" : "否"}
              onChange={(e) =>
                setDraftStudent({ ...draftStudent, isJpHs: e.target.value === "是" })
              }
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </Field>
          <Field label="日本高中在籍年数">
            <input
              type="number"
              min={0}
              max={6}
              className="select"
              value={draftStudent.jpHsYears}
              onChange={(e) =>
                setDraftStudent({ ...draftStudent, jpHsYears: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="国籍身份">
            <select
              className="select"
              value={draftStudent.nationality}
              onChange={(e) =>
                setDraftStudent({
                  ...draftStudent,
                  nationality: e.target.value as StudentCriteria["nationality"],
                })
              }
            >
              <option value="外国籍">外国籍</option>
              <option value="日本籍">日本籍</option>
            </select>
          </Field>
          <Field label="签证 / 在留资格">
            <select
              className="select"
              value={draftStudent.visaStatus}
              onChange={(e) =>
                setDraftStudent({ ...draftStudent, visaStatus: e.target.value })
              }
            >
              {VISA_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="日语程度">
            <select
              className="select"
              value={draftStudent.jpLevel}
              onChange={(e) =>
                setDraftStudent({ ...draftStudent, jpLevel: e.target.value })
              }
            >
              {JP_LEVELS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="出席率 (%)">
            <input
              type="number"
              min={0}
              max={100}
              className="select"
              value={draftStudent.attendance}
              onChange={(e) =>
                setDraftStudent({
                  ...draftStudent,
                  attendance: Number(e.target.value || 0),
                })
              }
            />
          </Field>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setAppliedStudent(draftStudent)}
            disabled={!isDirty}
            className="btn-primary flex-1"
          >
            {isDirty ? "确认筛选" : "已应用"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraftStudent(DEFAULT_STUDENT);
              setAppliedStudent(DEFAULT_STUDENT);
            }}
            className="btn-secondary"
          >
            重置
          </button>
        </div>
        {isDirty ? (
          <p className="mt-2 text-xs text-amber-700">
            条件已修改,点「确认筛选」后右侧才会更新
          </p>
        ) : null}

        <div className="mt-6 border-t border-zinc-100 pt-4">
          <div className="flex justify-between text-xs text-zinc-600">
            <span>⭕ 可报考</span>
            <span className="font-medium text-emerald-700">{counts.pass}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>🟡 需人工确认</span>
            <span className="font-medium text-amber-700">{counts.review}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>🔴 不可报考</span>
            <span className="font-medium text-rose-700">{counts.fail}</span>
          </div>
        </div>
      </aside>

      <section className="bg-white rounded-2xl border border-zinc-200 p-5">
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <input
            type="text"
            placeholder="搜索学校…"
            value={schoolQuery}
            onChange={(e) => setSchoolQuery(e.target.value)}
            className="select w-48"
          />
          <select
            className="select"
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
          >
            <option value="all">全部日程</option>
            {scheduleTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex gap-1 ml-auto">
            {FILTER_OPTIONS.map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setFilter(o.v)}
                className={
                  "px-3 py-1.5 rounded-lg text-xs " +
                  (filter === o.v
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1 text-xs text-zinc-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            含已停用学校
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-zinc-500 border-b border-zinc-200">
              <tr>
                <Th>学校</Th>
                <Th>选拔方式</Th>
                <Th>日程</Th>
                <Th>日语要求</Th>
                <Th>出席率</Th>
                <Th>出身</Th>
                <Th>签证</Th>
                <Th>日语</Th>
                <Th>出席</Th>
                <Th>综合</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row, result }) => (
                <tr key={row.id} className="border-b border-zinc-100 align-top">
                  <Td>{row.schoolName}</Td>
                  <Td className="whitespace-pre-line">{row.admissionMethod}</Td>
                  <Td>{row.scheduleType}</Td>
                  <Td className="max-w-[220px]">
                    <div className="text-xs whitespace-pre-line">
                      {row.requiresJp}
                      {row.jpRequirement ? `: ${row.jpRequirement}` : ""}
                      {row.jpExemption ? (
                        <span className="block text-zinc-400 mt-0.5">
                          免除: {row.jpExemption}
                        </span>
                      ) : null}
                    </div>
                  </Td>
                  <Td>{row.attendanceMin || "—"}</Td>
                  <JudgeCell v={result.origin} />
                  <JudgeCell v={result.visa} />
                  <JudgeCell v={result.jp} />
                  <JudgeCell v={result.attendance} />
                  <Td>
                    <OverallBadge v={result.overall} />
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-zinc-400 text-sm"
                  >
                    没有符合条件的记录
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-medium py-2 px-2">{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`py-2 px-2 ${className}`}>{children}</td>;
}

function JudgeCell({ v }: { v: "通过" | "不通过" | "未知" }) {
  const cls =
    v === "通过"
      ? "text-emerald-700"
      : v === "不通过"
        ? "text-rose-700"
        : "text-amber-700";
  return <Td className={`text-xs font-medium ${cls}`}>{v}</Td>;
}

function OverallBadge({
  v,
}: {
  v: "可报考" | "不可报考" | "需人工确认";
}) {
  const cls =
    v === "可报考"
      ? "bg-emerald-100 text-emerald-800"
      : v === "不可报考"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800";
  const icon = v === "可报考" ? "⭕" : v === "不可报考" ? "🔴" : "🟡";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {icon} {v}
    </span>
  );
}

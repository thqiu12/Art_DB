import Link from "next/link";

export type ProgramFormValues = {
  id?: string;
  schoolId: string;
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

const KAHI_OPTIONS = ["可", "不可", "两者可"];
const SCHEDULE_OPTIONS = ["留学生日程", "非留学生日程", "两者可"];
const REQUIRES_JP_OPTIONS = ["不需要", "必须", "条件免除"];

export default function ProgramForm({
  schools,
  values,
  action,
  submitLabel,
}: {
  schools: { id: string; name: string }[];
  values: ProgramFormValues;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="bg-white rounded-2xl border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Field label="学校" required>
        <select
          name="schoolId"
          defaultValue={values.schoolId}
          required
          className="select"
        >
          <option value="">— 请选择 —</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>

      <Field label="选拔方式" required>
        <input
          name="admissionMethod"
          defaultValue={values.admissionMethod}
          required
          className="select"
        />
      </Field>

      <Field label="日程类型">
        <DatalistInput
          name="scheduleType"
          defaultValue={values.scheduleType}
          options={SCHEDULE_OPTIONS}
        />
      </Field>

      <Field label="日高可否">
        <DatalistInput
          name="acceptsJpHs"
          defaultValue={values.acceptsJpHs}
          options={KAHI_OPTIONS}
        />
      </Field>

      <Field label="海外高中非留学签证 可否">
        <DatalistInput
          name="acceptsOverseasNonStudy"
          defaultValue={values.acceptsOverseasNonStudy}
          options={KAHI_OPTIONS}
        />
      </Field>

      <Field label="是否接受 留学签证">
        <DatalistInput
          name="acceptsStudyVisa"
          defaultValue={values.acceptsStudyVisa}
          options={KAHI_OPTIONS}
        />
      </Field>

      <Field label="是否接受 非留学签证 (定住/永住/家族)">
        <DatalistInput
          name="acceptsNonStudyVisa"
          defaultValue={values.acceptsNonStudyVisa}
          options={KAHI_OPTIONS}
        />
      </Field>

      <Field label="是否要求日语证明">
        <DatalistInput
          name="requiresJp"
          defaultValue={values.requiresJp}
          options={REQUIRES_JP_OPTIONS}
        />
      </Field>

      <Field label="日语要求 (如 N2,EJU 220+)">
        <input
          name="jpRequirement"
          defaultValue={values.jpRequirement ?? ""}
          className="select"
        />
      </Field>

      <Field label="日语免除条件 (如 日本高中)">
        <input
          name="jpExemption"
          defaultValue={values.jpExemption ?? ""}
          className="select"
        />
      </Field>

      <Field label="出席率最低要求 (%)">
        <input
          name="attendanceMin"
          type="number"
          min={0}
          max={100}
          defaultValue={values.attendanceMin}
          className="select"
        />
      </Field>

      <Field label="年份标记 (如 2027☑️)">
        <input
          name="yearTag"
          defaultValue={values.yearTag ?? ""}
          className="select"
        />
      </Field>

      <Field label="备注" full>
        <textarea
          name="remarks"
          defaultValue={values.remarks ?? ""}
          rows={3}
          className="select"
        />
      </Field>

      <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-zinc-100">
        <Link href="/admin/programs" className="btn-secondary">取消</Link>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs text-zinc-600">
        {label}{required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function DatalistInput({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: string[];
}) {
  const listId = `opts-${name}`;
  return (
    <>
      <input
        name={name}
        defaultValue={defaultValue}
        list={listId}
        className="select"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}

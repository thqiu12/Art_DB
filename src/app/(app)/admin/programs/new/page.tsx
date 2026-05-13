import { prisma } from "@/lib/db";
import { createProgram } from "@/lib/server-actions";
import ProgramForm from "../ProgramForm";

export const dynamic = "force-dynamic";

export default async function NewProgramPage() {
  const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">新建招生项目</h1>
      <ProgramForm
        schools={schools}
        values={{
          schoolId: "",
          admissionMethod: "",
          scheduleType: "",
          acceptsJpHs: "",
          acceptsOverseasNonStudy: "",
          acceptsStudyVisa: "",
          acceptsNonStudyVisa: "",
          requiresJp: "",
          jpRequirement: null,
          jpExemption: null,
          attendanceMin: 0,
          remarks: null,
          yearTag: null,
        }}
        action={createProgram}
        submitLabel="创建"
      />
    </div>
  );
}

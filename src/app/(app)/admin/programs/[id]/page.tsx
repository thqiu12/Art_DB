import { prisma } from "@/lib/db";
import { updateProgram } from "@/lib/server-actions";
import { notFound } from "next/navigation";
import ProgramForm from "../ProgramForm";

export const dynamic = "force-dynamic";

export default async function EditProgramPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [program, schools] = await Promise.all([
    prisma.program.findUnique({ where: { id } }),
    prisma.school.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!program) notFound();

  async function action(fd: FormData) {
    "use server";
    await updateProgram(id, fd);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">编辑招生项目</h1>
      <ProgramForm
        schools={schools}
        values={{
          id: program.id,
          schoolId: program.schoolId,
          admissionMethod: program.admissionMethod,
          scheduleType: program.scheduleType,
          acceptsJpHs: program.acceptsJpHs,
          acceptsOverseasNonStudy: program.acceptsOverseasNonStudy,
          acceptsStudyVisa: program.acceptsStudyVisa,
          acceptsNonStudyVisa: program.acceptsNonStudyVisa,
          requiresJp: program.requiresJp,
          jpRequirement: program.jpRequirement,
          jpExemption: program.jpExemption,
          attendanceMin: program.attendanceMin,
          remarks: program.remarks,
          yearTag: program.yearTag,
        }}
        action={action}
        submitLabel="保存"
      />
    </div>
  );
}

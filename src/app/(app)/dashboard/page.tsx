import { getAllPrograms } from "@/lib/data";
import FilterDashboard from "./FilterDashboard";

export default async function DashboardPage() {
  const programs = await getAllPrograms();
  const rows = programs.map((p) => ({
    id: p.id,
    schoolName: p.school.name,
    schoolActive: p.school.active,
    admissionMethod: p.admissionMethod,
    scheduleType: p.scheduleType,
    acceptsJpHs: p.acceptsJpHs,
    acceptsOverseasNonStudy: p.acceptsOverseasNonStudy,
    acceptsStudyVisa: p.acceptsStudyVisa,
    acceptsNonStudyVisa: p.acceptsNonStudyVisa,
    requiresJp: p.requiresJp,
    jpRequirement: p.jpRequirement,
    jpExemption: p.jpExemption,
    attendanceMin: p.attendanceMin,
    remarks: p.remarks,
    yearTag: p.yearTag,
  }));
  return <FilterDashboard rows={rows} />;
}

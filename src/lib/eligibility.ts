// 与原 Excel「主表」中 L–P 列(出身/签证/日语/出席/综合判定) 等价的判断逻辑。

export type StudentCriteria = {
  background: "日本高中" | "海外高中" | "";
  isJpHs: boolean;
  jpHsYears: number;
  nationality: "日本籍" | "外国籍" | "";
  visaStatus: string; // 留学 / 家族滞在 / 定住 / 永住 / 日本人配偶 / 永住者配偶 / 定住者配偶 / 日本籍 / ...
  jpLevel: string; // 无 / N5 / N4 / N3 / N2 / N1 / EJU 220+ / EJU 280+ / etc.
  attendance: number;
};

export type ProgramRow = {
  acceptsJpHs: string;
  acceptsOverseasNonStudy: string;
  acceptsStudyVisa: string;
  acceptsNonStudyVisa: string;
  requiresJp: string;
  jpRequirement: string | null;
  jpExemption: string | null;
  attendanceMin: number;
};

export type Judgement = "通过" | "不通过" | "未知";

export type EligibilityResult = {
  origin: Judgement;
  visa: Judgement;
  jp: Judgement;
  attendance: Judgement;
  overall: "可报考" | "不可报考" | "需人工确认";
};

const OK_VALUES = new Set(["可", "两者可", "両者可", "可以", "yes", "true"]);
const NO_VALUES = new Set(["不可", "否", "no", "false"]);

const isOk = (s: string | null | undefined) =>
  s ? OK_VALUES.has(s.trim()) : false;
const isNo = (s: string | null | undefined) =>
  s ? NO_VALUES.has(s.trim()) : false;

// 留学签证组(只有「留学」)
const STUDY_VISAS = new Set(["留学"]);
// 非留学签证组(定住/永住/家族/日本人配偶 等)
const NON_STUDY_VISAS = new Set([
  "家族滞在",
  "定住",
  "永住",
  "日本人配偶",
  "永住者配偶",
  "定住者配偶",
  "日本人の配偶者等",
  "永住者の配偶者等",
  "定住者",
  "永住者",
]);

const JLPT_ORDER = ["N5", "N4", "N3", "N2", "N1"]; // 由低到高
function jlptLevel(s: string): number {
  const m = s.match(/N[1-5]/);
  if (!m) return -1;
  return JLPT_ORDER.indexOf(m[0]);
}

function ejuScore(s: string): number {
  const m = s.match(/EJU\s*(\d{2,3})/);
  return m ? parseInt(m[1], 10) : -1;
}

function judgeOrigin(s: StudentCriteria, p: ProgramRow): Judgement {
  if (s.isJpHs) {
    if (isOk(p.acceptsJpHs)) return "通过";
    if (isNo(p.acceptsJpHs)) return "不通过";
    return "未知";
  }
  // 海外高中 + 非留学签证
  if (s.background === "海外高中" && s.visaStatus && !STUDY_VISAS.has(s.visaStatus)) {
    if (isOk(p.acceptsOverseasNonStudy)) return "通过";
    if (isNo(p.acceptsOverseasNonStudy)) return "不通过";
    return "未知";
  }
  // 其他情况 (例如海外高中 + 留学签证), 不在该数据库主要覆盖范围内
  return "未知";
}

function judgeVisa(s: StudentCriteria, p: ProgramRow): Judgement {
  if (!s.visaStatus) return "未知";
  if (STUDY_VISAS.has(s.visaStatus)) {
    if (isOk(p.acceptsStudyVisa)) return "通过";
    if (isNo(p.acceptsStudyVisa)) return "不通过";
    return "未知";
  }
  if (NON_STUDY_VISAS.has(s.visaStatus) || s.nationality === "日本籍") {
    if (isOk(p.acceptsNonStudyVisa)) return "通过";
    if (isNo(p.acceptsNonStudyVisa)) return "不通过";
    return "未知";
  }
  return "未知";
}

function judgeJp(s: StudentCriteria, p: ProgramRow): Judgement {
  const req = (p.requiresJp ?? "").trim();
  if (req === "不需要" || req === "" || req === "无") return "通过";

  // 条件免除: 满足免除条件即通过 (常见为「日本高中」)
  if (req === "条件免除") {
    const exempt = (p.jpExemption ?? "").trim();
    if (exempt) {
      if (exempt.includes("日本高中") && s.isJpHs) return "通过";
      // 其他免除条件目前默认未知
    }
  }

  // 否则比对日语要求
  const requirement = (p.jpRequirement ?? "").trim();
  const studentLv = (s.jpLevel ?? "").trim();
  if (!requirement || requirement === "无") return "通过";
  if (!studentLv || studentLv === "无") return "不通过";

  // 任一项满足即可
  const parts = requirement.split(/[,、,]/).map((x) => x.trim()).filter(Boolean);
  for (const part of parts) {
    // JLPT
    const reqJ = jlptLevel(part);
    const stuJ = jlptLevel(studentLv);
    if (reqJ >= 0 && stuJ >= reqJ) return "通过";
    // EJU
    const reqE = ejuScore(part);
    const stuE = ejuScore(studentLv);
    if (reqE >= 0 && stuE >= reqE) return "通过";
  }
  // 不确定的复杂条件 (JPT/J.TEST/BJT 等) 暂归未知,UI 中以「需人工确认」呈现
  if (parts.some((p) => /JPT|J\.TEST|BJT/i.test(p))) return "未知";
  return "不通过";
}

function judgeAttendance(s: StudentCriteria, p: ProgramRow): Judgement {
  if (!p.attendanceMin || p.attendanceMin <= 0) return "通过";
  if (s.attendance >= p.attendanceMin) return "通过";
  return "不通过";
}

export function evaluate(
  student: StudentCriteria,
  program: ProgramRow,
): EligibilityResult {
  const origin = judgeOrigin(student, program);
  const visa = judgeVisa(student, program);
  const jp = judgeJp(student, program);
  const attendance = judgeAttendance(student, program);
  const all = [origin, visa, jp, attendance];

  let overall: EligibilityResult["overall"] = "可报考";
  if (all.some((x) => x === "不通过")) overall = "不可报考";
  else if (all.some((x) => x === "未知")) overall = "需人工确认";

  return { origin, visa, jp, attendance, overall };
}

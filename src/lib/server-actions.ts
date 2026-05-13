"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requireEditor() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EDITOR") {
    throw new Error("Forbidden");
  }
  return session.user;
}

const programSchema = z.object({
  schoolId: z.string().min(1),
  admissionMethod: z.string().min(1),
  scheduleType: z.string().default(""),
  acceptsJpHs: z.string().default(""),
  acceptsOverseasNonStudy: z.string().default(""),
  acceptsStudyVisa: z.string().default(""),
  acceptsNonStudyVisa: z.string().default(""),
  requiresJp: z.string().default(""),
  jpRequirement: z.string().optional().nullable(),
  jpExemption: z.string().optional().nullable(),
  attendanceMin: z.coerce.number().int().min(0).max(100).default(0),
  remarks: z.string().optional().nullable(),
  yearTag: z.string().optional().nullable(),
});

function extractProgram(fd: FormData) {
  const obj: Record<string, FormDataEntryValue | null> = {};
  for (const k of [
    "schoolId",
    "admissionMethod",
    "scheduleType",
    "acceptsJpHs",
    "acceptsOverseasNonStudy",
    "acceptsStudyVisa",
    "acceptsNonStudyVisa",
    "requiresJp",
    "jpRequirement",
    "jpExemption",
    "attendanceMin",
    "remarks",
    "yearTag",
  ]) {
    obj[k] = fd.get(k);
  }
  return programSchema.parse({
    ...obj,
    jpRequirement: obj.jpRequirement?.toString().trim() || null,
    jpExemption: obj.jpExemption?.toString().trim() || null,
    remarks: obj.remarks?.toString().trim() || null,
    yearTag: obj.yearTag?.toString().trim() || null,
  });
}

export async function createProgram(fd: FormData) {
  await requireEditor();
  const data = extractProgram(fd);
  const p = await prisma.program.create({ data });
  revalidatePath("/admin/programs");
  revalidatePath("/dashboard");
  redirect(`/admin/programs/${p.id}`);
}

export async function updateProgram(id: string, fd: FormData) {
  await requireEditor();
  const data = extractProgram(fd);
  await prisma.program.update({ where: { id }, data });
  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProgram(id: string) {
  await requireEditor();
  await prisma.program.delete({ where: { id } });
  revalidatePath("/admin/programs");
  revalidatePath("/dashboard");
}

const schoolSchema = z.object({
  name: z.string().min(1),
  active: z.coerce.boolean().default(true),
});

export async function createSchool(fd: FormData) {
  await requireEditor();
  const name = fd.get("name")?.toString().trim() ?? "";
  const data = schoolSchema.parse({ name, active: true });
  await prisma.school.create({ data });
  revalidatePath("/admin/schools");
  revalidatePath("/dashboard");
}

export async function updateSchool(id: string, fd: FormData) {
  await requireEditor();
  const name = fd.get("name")?.toString().trim() ?? "";
  const active = fd.get("active")?.toString() === "on";
  await prisma.school.update({
    where: { id },
    data: schoolSchema.parse({ name, active }),
  });
  revalidatePath("/admin/schools");
  revalidatePath("/dashboard");
}

export async function deleteSchool(id: string) {
  await requireEditor();
  await prisma.school.delete({ where: { id } });
  revalidatePath("/admin/schools");
  revalidatePath("/dashboard");
}

const userCreateSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
  displayName: z.string().optional().nullable(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export async function createUser(fd: FormData) {
  await requireEditor();
  const data = userCreateSchema.parse({
    username: fd.get("username"),
    password: fd.get("password"),
    displayName: fd.get("displayName") || null,
    role: fd.get("role"),
  });
  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      username: data.username,
      passwordHash,
      displayName: data.displayName || null,
      role: data.role,
    },
  });
  revalidatePath("/admin/users");
}

export async function updateUser(id: string, fd: FormData) {
  await requireEditor();
  const displayName = fd.get("displayName")?.toString() || null;
  const role = fd.get("role")?.toString() === "EDITOR" ? "EDITOR" : "VIEWER";
  const newPassword = fd.get("password")?.toString() || "";
  const data: {
    displayName: string | null;
    role: "EDITOR" | "VIEWER";
    passwordHash?: string;
  } = { displayName, role };
  if (newPassword) {
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const me = await requireEditor();
  if (me.id === id) throw new Error("不能删除自己");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

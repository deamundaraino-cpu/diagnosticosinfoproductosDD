"use server";

import { redirect } from "next/navigation";
import {
  cerrarSesionAdmin,
  crearSesionAdmin,
  passwordCorrecta,
} from "@/lib/admin-auth";

export async function loginAdmin(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!passwordCorrecta(password)) {
    redirect("/admin/login?error=1");
  }
  await crearSesionAdmin();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await cerrarSesionAdmin();
  redirect("/admin/login");
}

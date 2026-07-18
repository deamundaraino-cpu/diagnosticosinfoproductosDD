import type { Viewport } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata = {
  title: "Tu diagnóstico | Daviddigital",
};

export const viewport: Viewport = { themeColor: "#0D1420" };

export default function PaginaDiagnostico() {
  return <Quiz />;
}

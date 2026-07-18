import { redirect } from "next/navigation";
import { esAdmin } from "@/lib/admin-auth";
import { loginAdmin } from "../actions";

export const metadata = { title: "Admin | Daviddigital" };

export default async function LoginAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await esAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-5">
      <form
        action={loginAdmin}
        className="w-full max-w-xs rounded-2xl bg-white border border-stone-200 shadow-sm p-6 space-y-4"
      >
        <h1 className="text-lg font-bold text-stone-900">Panel interno</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {error && (
          <p className="text-sm text-red-600">Password incorrecta.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}

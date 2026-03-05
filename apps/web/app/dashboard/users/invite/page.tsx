"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Mail, UserPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createStaffMember } from "@/app/actions/users";

const roles = [
  { value: "doctor", label: "Doctor", description: "Can view and treat patients, access full EMR" },
  { value: "nurse", label: "Nurse", description: "Can take vitals and assist with patient care" },
  { value: "receptionist", label: "Receptionist", description: "Manages appointments and patient check-in" },
  { value: "lab_tech", label: "Lab Technician", description: "Handles lab requests and enters results" },
];

export default function InviteStaffPage() {
  const router = useRouter();
  const [role, setRole] = useState("doctor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createStaffMember(formData);
      
      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success && result.credentials) {
        const { email, password, fullName } = result.credentials;
        router.push(`/dashboard/users?created=1&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(fullName)}`);
      } else {
        router.push("/dashboard/users");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Invite Staff Member</h2>
          <p className="text-slate-500 text-sm italic">Add a new team member to your clinic.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> New Team Member</CardTitle>
          <CardDescription>Fill in the profile details to add a staff member directly.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 font-bold">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                <input name="fullName" required className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address *</label>
                <input name="email" type="email" required className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</label>
                <input name="phone" className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Specialization</label>
                <input name="specialization" placeholder="e.g. Cardiology, Pediatrics..." className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Role & Access Level *
              </label>
              <input type="hidden" name="role" value={role} />
              <div className="grid gap-3 md:grid-cols-2">
                {roles.map((r) => (
                  <div
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      role === r.value ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className={`text-sm font-black ${role === r.value ? "text-primary" : "text-slate-700"}`}>{r.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <Link href="/dashboard/users" className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-70 transition-all"
              >
                <Mail className="mr-2 h-4 w-4" />
                {saving ? "Adding..." : "Add Staff Member"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

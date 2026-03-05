"use client";

import { useFormStatus } from "react-dom";
import { onboardClinic } from "@/app/actions/onboarding";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Globe, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-primary/30 hover:brightness-110 transition-all active:scale-95 disabled:opacity-70"
    >
      {pending ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your clinic...</>
      ) : (
        <><ArrowRight className="h-4 w-4" /> Launch My Clinic</>
      )}
    </button>
  );
}

export default function OnboardingForm() {
  const [error, setError] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  async function clientAction(formData: FormData) {
    setError({});
    const result = await onboardClinic(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4">
      {/* Absolute Header for Sign Out */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-tight shadow-sm"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-white shadow-xl mb-4 rotate-3 transform transition-transform hover:rotate-0">
             <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome to ClinixPro</h1>
          <p className="text-slate-500">Let's set up your medical practice in a few seconds.</p>
        </div>

        <Card className="shadow-2xl border-none ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>Practice Setup</CardTitle>
            <CardDescription>Enter your clinic details to get started.</CardDescription>
            {error._form && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-[10px] text-red-600 font-bold">
                {error._form}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form action={clientAction} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Clinic Name *
                </label>
                <input
                  name="clinicName"
                  required
                  className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. HealthCare Center"
                />
                {error.clinicName && (
                  <p className="text-[10px] text-red-500 font-bold">{error.clinicName[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Globe className="h-4 w-4" /> URL Identifier (Subdomain) *
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                  <input
                    name="subdomain"
                    required
                    className="flex-1 bg-transparent p-3 text-sm outline-none"
                    placeholder="yourpractice"
                  />
                  <span className="pr-3 text-xs text-slate-400 font-bold">.clinixpro.com</span>
                </div>
                {error.subdomain && (
                  <p className="text-[10px] text-red-500 font-bold">{error.subdomain[0]}</p>
                )}
              </div>

              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

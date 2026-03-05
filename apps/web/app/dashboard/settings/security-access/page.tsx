"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updatePassword } from "@/app/actions/auth";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Password updated successfully!");
      e.currentTarget.reset();
    }
    setIsLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Security & Access</h2>
          <p className="text-slate-500 text-sm italic">Manage your password and security preferences.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</CardTitle>
          <CardDescription>Update your account password to keep your clinical data secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">New Password</label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" 
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm New Password</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50" 
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-8 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-70 transition-all font-black"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Security Tip</p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Use a combination of uppercase letters, numbers, and symbols to create a strong password. 
          Avoid using easily guessable information like birthdays or common words.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Loader2, Mail, Lock, User, Building2, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { signupWithClinic } from "./action";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signupWithClinic(formData);

    if (result?.error) {
      setErrors(result.error);
      if (result.error._form) {
        toast.error(result.error._form[0]);
      } else {
        toast.error("Please correct the errors in the form.");
      }
      setIsLoading(false);
    } else {
      toast.success("Account created successfully!");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full py-12">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Activity className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-primary/30 decoration-4 underline-offset-8">
            Create Account
          </h1>
          <p className="text-slate-500 font-medium">Start your 14-day free trial today</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="Dr. John Doe"
                  />
                </div>
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="doctor@clinixpro.com"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password[0]}</p>}
              </div>

              <div className="pt-4 border-t border-slate-50">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 opacity-50">Clinic Details</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Clinic Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    name="clinicName"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="e.g. HealthCare Center"
                  />
                </div>
                {errors.clinicName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.clinicName[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subdomain</label>
                <div className="relative group flex items-center">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    name="subdomain"
                    type="text"
                    required
                    className="w-full pl-12 pr-24 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="yourpractice"
                  />
                  <span className="absolute right-4 text-[10px] font-black text-slate-300 uppercase">.clinixpro.com</span>
                </div>
                {errors.subdomain && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.subdomain[0]}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Practice <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-bold">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline underline-offset-4 font-black">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-8">
          &copy; 2024 ClinixPro Healthcare Systems
        </p>
      </div>
    </div>
  );
}

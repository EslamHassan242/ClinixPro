"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { patientSchema } from "@clinixpro/shared/validators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Save, User, Phone, HeartPulse, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createPatient } from "@/app/actions/patients";

export default function NewPatientPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(
      patientSchema.extend({
        dateOfBirth: z.preprocess((val) => {
          if (!val || typeof val !== 'string') return undefined;
          return new Date(val);
        }, z.date().optional()),
        allergies: z.any().transform(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
        chronicDiseases: z.any().transform(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
      })
    ),
    defaultValues: {
      fullName: "",
      phone: "",
      gender: "Male",
      email: "",
      address: "",
      dateOfBirth: "",
      bloodType: undefined,
      idType: "National ID",
      idNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      allergies: "",
      chronicDiseases: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        allergies: typeof data.allergies === 'string' ? data.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        chronicDiseases: typeof data.chronicDiseases === 'string' ? data.chronicDiseases.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      };

      const result = await createPatient(formattedData);
      router.push("/dashboard/patients");
    } catch (error: any) {
      console.error("Failed to create patient:", error);
      alert(error.message || "Something went wrong. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Register New Patient</h2>
          <p className="text-slate-500 italic text-sm">Fill in the details to create a new medical record in your practice.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <StepIndicator current={step} step={1} label="Basic Info" icon={User} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepIndicator current={step} step={2} label="Contact & ID" icon={Phone} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepIndicator current={step} step={3} label="Medical History" icon={HeartPulse} />
      </div>

      <Card className="shadow-xl border-none ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-8">
              {step === 1 && (
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name *</label>
                    <input {...form.register("fullName")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter full name" />
                    {form.formState.errors.fullName && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.fullName.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Gender</label>
                    <select {...form.register("gender")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all cursor-pointer">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Date of Birth</label>
                    <input type="date" {...form.register("dateOfBirth")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Blood Type</label>
                    <select {...form.register("bloodType")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all cursor-pointer">
                      <option value="">Select blood type</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number *</label>
                    <input {...form.register("phone")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" placeholder="+1234567890" />
                    {form.formState.errors.phone && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.phone.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input type="email" {...form.register("email")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" placeholder="email@example.com" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Address</label>
                    <textarea {...form.register("address")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm min-h-[80px] outline-none focus:border-primary transition-all" placeholder="Enter physical address" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">ID Type</label>
                    <select {...form.register("idType")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all cursor-pointer">
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">ID Number</label>
                    <input {...form.register("idNumber")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" placeholder="123456789" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      Allergies (comma separated)
                    </label>
                    <input {...form.register("allergies")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" placeholder="e.g. Penicillin, Peanuts" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-secondary" />
                      Chronic Diseases (comma separated)
                    </label>
                    <textarea {...form.register("chronicDiseases")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm min-h-[80px] outline-none focus:border-primary transition-all" placeholder="e.g. Diabetes, Hypertension" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100">
                     <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Emergency Contact Name</label>
                      <input {...form.register("emergencyContactName")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Emergency Contact Phone</label>
                      <input {...form.register("emergencyContactPhone")} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between bg-slate-50/50 p-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1 || isSubmitting}
                className="inline-flex items-center px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={async () => {
                    const fields: any = step === 1 
                      ? ["fullName", "gender", "dateOfBirth", "bloodType"]
                      : ["phone", "email", "address", "idType", "idNumber"];
                    const isValid = await form.trigger(fields);
                    if (isValid) setStep(s => s + 1);
                  }}
                  className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-white hover:brightness-110 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="inline-flex items-center px-10 py-3 rounded-lg bg-secondary text-white hover:brightness-110 text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    'Registering...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Finalize Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StepIndicator({ current, step, label, icon: Icon }: any) {
  const isActive = current === step;
  const isCompleted = current > step;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all",
        isActive ? "border-primary bg-primary text-white scale-110" : 
        isCompleted ? "border-primary bg-primary/10 text-primary" : "border-slate-300 text-slate-400"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-slate-500")}>
        {label}
      </span>
    </div>
  );
}

import Link from "next/link";
import { Building2, Stethoscope, Bell, Shield, CreditCard, ArrowRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingSections = [
  {
    href: "/dashboard/settings/clinic",
    icon: Building2,
    title: "Clinic Profile",
    description: "Manage your clinic's name, logo, contact info, and operational hours.",
    color: "bg-blue-500",
  },
  {
    href: "/dashboard/settings/services",
    icon: Stethoscope,
    title: "Services & Pricing",
    description: "Define the medical services you offer and their associated costs.",
    color: "bg-emerald-500",
  },
  {
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Configure payment methods, invoice templates, and tax settings.",
    color: "bg-orange-500",
  },
  {
    href: "/dashboard/settings/notifications",
    icon: Bell,
    title: "Notifications",
    description: "Set up automated reminders for appointments, follow-ups, and results.",
    color: "bg-purple-500",
  },
  {
    href: "/dashboard/settings/security",
    icon: Shield,
    title: "Security & Access",
    description: "Manage roles, permissions, and two-factor authentication settings.",
    color: "bg-rose-500",
  },
  {
    href: "/dashboard/settings/lookups",
    icon: ClipboardList,
    title: "Master Catalog",
    description: "Manage medicines, lab tests, radiology types, and target organs.",
    color: "bg-slate-800",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Settings</h2>
        <p className="text-slate-500 font-medium italic">
          Configure your clinic's operations, branding, and preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="group border-none shadow-xl ring-1 ring-slate-200 overflow-hidden hover:ring-2 hover:ring-primary/30 hover:shadow-2xl transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${section.color}`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 mb-1">{section.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{section.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
            Subscription Plan
          </CardTitle>
          <CardDescription>You are currently on the Basic plan.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-black text-2xl text-slate-800">Basic</p>
            <p className="text-sm text-slate-500">Up to 500 patients · 5 staff accounts · 10 GB storage</p>
          </div>
          <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
            Upgrade Plan
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

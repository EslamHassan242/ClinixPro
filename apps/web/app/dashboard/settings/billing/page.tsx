import Link from "next/link";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Billing & Payments</h2>
          <p className="text-slate-500 text-sm italic">Configure your clinic's billing templates and payment methods.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Billing Configuration</CardTitle>
          <CardDescription>Setup your invoice details and payment defaults.</CardDescription>
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <CreditCard className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <p className="text-lg font-black text-slate-800">Coming Soon</p>
                <p className="text-sm text-slate-500 max-w-xs">We are currently building this settings module. It will be available in a future update.</p>
            </div>
            <Link href="/dashboard/settings" className="text-primary font-black text-sm uppercase tracking-widest hover:underline">
                Back to Settings
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}

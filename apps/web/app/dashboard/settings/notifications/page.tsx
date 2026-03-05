import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Notifications</h2>
          <p className="text-slate-500 text-sm italic">Manage automated SMS and Email alerts for your patients and staff.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notification Settings</CardTitle>
          <CardDescription>Configure how your clinic communicates with stakeholders.</CardDescription>
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <p className="text-lg font-black text-slate-800">Coming Soon</p>
                <p className="text-sm text-slate-500 max-w-xs">Automated notifications are currently under development. Stay tuned!</p>
            </div>
            <Link href="/dashboard/settings" className="text-primary font-black text-sm uppercase tracking-widest hover:underline">
                Back to Settings
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}

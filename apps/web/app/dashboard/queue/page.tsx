import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";
import { QueueManager } from "@/components/medical/queue-manager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Clock, Activity } from "lucide-react";

export default async function QueuePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, tenantId: true },
  });

  if (!profile) redirect("/onboarding");

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Live Patient Queue</h2>
        <p className="text-slate-500 font-medium italic">Real-time status of patients currently in the clinic.</p>
      </div>

      <QueueManager role={profile.role as any} />
    </div>
  );
}

import { getUserProfile } from "@/lib/auth-utils";
import { QueueManager } from "@/components/medical/queue-manager";

export default async function QueuePage() {
  const profile = await getUserProfile();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Live Patient Queue</h2>
        <p className="text-slate-500 font-medium italic">Real-time status of patients currently in the clinic.</p>
      </div>

      <QueueManager role={profile.role as any} tenantId={profile.tenantId} />
    </div>
  );
}

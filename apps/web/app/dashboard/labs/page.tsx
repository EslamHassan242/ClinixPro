import Link from "next/link";
import { Plus, Search, Microscope, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";

const statusStyles: Record<string, { icon: React.ElementType; class: string; label: string }> = {
  pending: { icon: Clock, class: "bg-yellow-50 text-yellow-700 ring-yellow-200", label: "Pending" },
  in_progress: { icon: Microscope, class: "bg-blue-50 text-blue-700 ring-blue-200", label: "In Progress" },
  completed: { icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Completed" },
  cancelled: { icon: XCircle, class: "bg-red-50 text-red-700 ring-red-200", label: "Cancelled" },
  abnormal: { icon: AlertCircle, class: "bg-rose-50 text-rose-700 ring-rose-200", label: "Abnormal" },
};

async function getLabTests() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });
  if (!profile) redirect("/onboarding");

  // In the current schema, LabInvestigations are linked to medicalRecords
  const labs = await prisma.labInvestigation.findMany({
    where: {
      medicalRecord: {
        tenantId: profile.tenantId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      medicalRecord: {
        include: {
          patient: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  const formattedLabs = labs.map((l) => ({
    ...l,
    patient: l.medicalRecord.patient,
    requestedAt: l.createdAt,
  }));

  const counts = {
    total: formattedLabs.length,
    pending: formattedLabs.filter((l) => l.status === "pending").length,
    inProgress: formattedLabs.filter((l) => l.status === "in_progress").length,
    completed: formattedLabs.filter((l) => l.status === "completed").length,
  };

  return { labs: formattedLabs, counts };
}

export default async function LabsPage() {
  const { labs, counts } = await getLabTests();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Lab Tests</h2>
          <p className="text-slate-500 font-medium italic text-sm">
            Manage laboratory test requests, track results, and flag abnormal findings.
          </p>
        </div>
        <Link
          href="/dashboard/labs/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Requests", value: counts.total, color: "bg-slate-700" },
          { label: "Pending", value: counts.pending, color: "bg-yellow-500" },
          { label: "In Progress", value: counts.inProgress, color: "bg-blue-500" },
          { label: "Completed", value: counts.completed, color: "bg-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl ring-1 ring-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <Microscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search by patient or test name..."
                className="w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] border-b">
                <tr>
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Results</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Microscope className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 italic text-sm">No lab tests found.</p>
                      <Link href="/dashboard/labs/new" className="text-primary text-xs font-bold hover:underline mt-1 block">
                        Create the first lab request →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  labs.map((lab) => {
                    const statusInfo = statusStyles[lab.status] || statusStyles.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr key={lab.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{lab.testName}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{lab.patient.fullName}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(lab.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ring-1 ${statusInfo.class}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {lab.results ? (
                            <span className="text-slate-700 font-medium">{String(lab.results).substring(0, 40)}…</span>
                          ) : (
                            <span className="text-slate-300 italic">Awaiting results</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider text-primary border border-primary/20 hover:bg-primary/5 transition-all">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

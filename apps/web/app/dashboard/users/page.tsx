import Link from "next/link";
import { Plus, Search, MoreVertical, Mail, Phone, ShieldCheck, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";
import CredentialsBanner from "./credentials-banner";
import StaffClient from "./staff-client";

const roleColors: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  doctor: "bg-blue-100 text-blue-700",
  nurse: "bg-emerald-100 text-emerald-700",
  receptionist: "bg-violet-100 text-violet-700",
  lab_tech: "bg-orange-100 text-orange-700",
};

async function getStaffMembers() {
  const profile = await getUserProfile();

  const staff = await prisma.profile.findMany({
    where: { tenantId: profile.tenantId },
    orderBy: { createdAt: "asc" },
  });

  return staff;
}

export default async function UsersPage(props: {
  searchParams: Promise<{ created?: string; email?: string; password?: string; name?: string }>;
}) {
  const searchParams = await props.searchParams;
  const staff = await getStaffMembers();
  const justCreated = searchParams.created === "1";

  return (
    <div className="space-y-6 pb-12">
      {/* Credentials Banner — shown right after a staff account is created */}
      {justCreated && searchParams.email && searchParams.password && (
        <CredentialsBanner
          name={decodeURIComponent(searchParams.name || "")}
          email={decodeURIComponent(searchParams.email)}
          password={decodeURIComponent(searchParams.password)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Staff Management</h2>
          <p className="text-slate-500 font-medium italic text-sm">
            Manage your clinical team members, roles, and access permissions.
          </p>
        </div>
        <Link
          href="/dashboard/users/invite"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Staff", value: staff.length, color: "bg-blue-500" },
          { label: "Doctors", value: staff.filter(s => s.role === "doctor").length, color: "bg-emerald-500" },
          { label: "Nurses", value: staff.filter(s => s.role === "nurse").length, color: "bg-violet-500" },
          { label: "Active", value: staff.filter(s => s.isActive).length, color: "bg-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-xl ring-1 ring-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <UserCog className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff Table */}
      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search staff by name or role..."
                className="w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <StaffClient staff={staff} />
        </CardContent>
      </Card>
    </div>
  );
}

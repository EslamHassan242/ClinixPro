import { checkOnboardingStatus } from "@/app/actions/onboarding";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/layout/dashboard-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await checkOnboardingStatus();

  if (!profile || !profile.tenant) {
    redirect("/onboarding");
  }

  const role = (profile.role as any) || "receptionist"; 

  return <DashboardClient profile={profile} role={role}>{children}</DashboardClient>;
}

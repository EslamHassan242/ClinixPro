import { auth } from "@clerk/nextjs/server";
import { prisma } from "@clinixpro/database";
import { redirect } from "next/navigation";
import NewAppointmentClient from "./appointment-client";

export default async function NewAppointmentPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });

  if (!profile) redirect("/onboarding");

  // Fetch doctors (any profile with role 'doctor')
  const doctors = await prisma.profile.findMany({
    where: {
      tenantId: profile.tenantId,
      role: "doctor",
      isActive: true,
    },
    select: { id: true, fullName: true, specialization: true },
    orderBy: { fullName: "asc" },
  });

  // Fetch active services
  const services = await prisma.service.findMany({
    where: {
      tenantId: profile.tenantId,
      isActive: true,
    },
    select: { id: true, name: true, duration: true, price: true },
    orderBy: { name: "asc" },
  });

  return <NewAppointmentClient doctors={doctors} services={services} />;
}

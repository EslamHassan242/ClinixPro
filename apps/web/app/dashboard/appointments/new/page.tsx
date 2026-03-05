import { prisma } from "@clinixpro/database";
import { getUserProfile } from "@/lib/auth-utils";
import NewAppointmentClient from "./appointment-client";

export default async function NewAppointmentPage() {
  const profile = await getUserProfile();

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

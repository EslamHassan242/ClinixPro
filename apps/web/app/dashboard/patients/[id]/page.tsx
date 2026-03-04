import { notFound } from "next/navigation";
import { getPatientById } from "@/app/actions/patients";
import { PatientProfileClient } from "@/components/medical/patient-profile-client";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  return <PatientProfileClient patient={patient} />;
}

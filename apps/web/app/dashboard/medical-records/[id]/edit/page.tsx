import { notFound } from "next/navigation";
import { getMedicalRecordById } from "@/app/actions/medical-records";
import { getLookups } from "@/app/actions/lookups";
import EditRecordClient from "./edit-record-client";

export default async function EditMedicalRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getMedicalRecordById(id);
  const lookups = await getLookups();

  if (!record) {
    notFound();
  }

  return <EditRecordClient record={record} lookups={lookups} />;
}

import { getServices } from "@/app/actions/services";
import ServicesClient from "./services-client";

export default async function ServicesSettingsPage() {
  const services = await getServices();
  
  return <ServicesClient initialServices={services} />;
}

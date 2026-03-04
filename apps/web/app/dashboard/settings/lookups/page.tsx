import { LookupManagerClient } from "@/components/settings/lookup-manager-client";
import { Card, CardContent } from "@/components/ui/card";

export default function LookupSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clinic Lookups</h1>
      </div>
      
      <LookupManagerClient />
    </div>
  );
}

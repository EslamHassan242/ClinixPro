import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPatients } from "@/app/actions/patients";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const patients = await getPatients(query);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Patients Registry</h2>
          <p className="text-muted-foreground italic text-sm">Manage patient records, medical history, and clinical documentation.</p>
        </div>
        <Link 
          href="/dashboard/patients/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 shadow-md transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Link>
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <form action="">
                 <input 
                  name="q"
                  defaultValue={query}
                  type="search" 
                  placeholder="ID, Name, or Contact..." 
                  className="w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                 />
              </form>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filters
              </button>
              <button className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
                <Download className="mr-2 h-4 w-4 text-slate-500" /> Export
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] border-b">
                <tr>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender / Age</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Last Visit</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      No patients found. {query && `Try searching for something else or `} 
                      <Link href="/dashboard/patients/new" className="text-primary font-bold hover:underline">add a new patient</Link>.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">{patient.mrn || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{patient.fullName}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{patient.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold text-slate-600">
                        {patient.gender} <span className="text-slate-300 mx-1">/</span> {patient.dateOfBirth ? `${Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 31536000000)}Y` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{patient.phone}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">No visits recorded</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/dashboard/patients/${patient.id}`}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-all shadow-sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

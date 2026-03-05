import Link from "next/link";
import { Plus, Search, Filter, Download, MoreVertical, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getInvoices } from "@/app/actions/billing";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 uppercase">Billing & Invoices</h2>
          <p className="text-slate-500 font-medium italic text-xs sm:text-sm">Track payments, manage patient accounts, and view financial reports.</p>
        </div>
        <Link 
          href="/dashboard/billing/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 sm:px-8 py-3.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] text-white hover:brightness-110 shadow-xl shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <StatCard title="Total Revenue (Clinic)" value={`$${totalRevenue.toLocaleString()}`} trend="+12.5%" isPositive color="bg-emerald-500" />
         <StatCard title="Outstanding Balance" value={`$${pendingAmount.toLocaleString()}`} trend="-2.1%" isPositive={false} color="bg-red-500" />
         <StatCard title="Collection Rate" value="96.4%" trend="+0.5%" isPositive color="bg-blue-500" />
      </div>

      <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b py-6 px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm order-2 sm:order-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="search" 
                placeholder="Invoice #, patient..." 
                className="w-full rounded-lg border-slate-200 bg-white pl-10 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all border shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 order-1 sm:order-2">
               <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Filter className="mr-1.5 h-3.5 w-3.5" /> Filter
               </button>
               <button className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export
               </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/30 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em] border-b">
                <tr>
                  <th className="px-8 py-5">Invoice #</th>
                  <th className="px-8 py-5">Patient</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Balance</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-slate-400 italic font-medium">No invoices found for this clinic.</td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-4 font-mono text-[11px] font-black text-primary">{inv.invoiceNumber}</td>
                      <td className="px-8 py-4">
                         <div className="font-black text-slate-700">{inv.patient.fullName}</div>
                         <div className="text-[10px] text-slate-400 font-mono italic">{inv.patient.mrn}</div>
                      </td>
                      <td className="px-8 py-4 text-slate-500 font-medium">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="px-8 py-4 font-black text-slate-900">${inv.total.toFixed(2)}</td>
                      <td className="px-8 py-4">
                         <StatusBadge status={inv.status as any} />
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-400">${(inv.total - inv.paidAmount).toFixed(2)}</td>
                      <td className="px-8 py-4 text-right">
                         <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all text-slate-400">
                           <MoreVertical className="h-4 w-4" />
                         </button>
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

function StatusBadge({ status }: { status: 'paid' | 'unpaid' | 'partial' | 'draft' | 'cancelled' | 'overdue' }) {
   const variants: any = {
     paid: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100",
     unpaid: "bg-red-50 text-red-700 border-red-200 shadow-red-100",
     partial: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100",
     draft: "bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100",
     cancelled: "bg-slate-100 text-slate-400 border-slate-200 shadow-none",
     overdue: "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100"
   };
   
   const icons: any = {
     paid: <CheckCircle2 className="h-3 w-3 mr-1.5" />,
     unpaid: <AlertCircle className="h-3 w-3 mr-1.5" />,
     partial: <Clock className="h-3 w-3 mr-1.5" />,
     overdue: <AlertCircle className="h-3 w-3 mr-1.5 animate-pulse" />
   };
   
   return (
     <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all", variants[status] || variants.draft)}>
        {icons[status]}
        {status}
     </span>
   );
}

function StatCard({ title, value, trend, isPositive, color }: any) {
   return (
      <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden group hover:ring-2 hover:ring-primary/20 transition-all">
         <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
                {isPositive ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              </div>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Analytics</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</div>
              <div className="flex items-baseline gap-3">
                 <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
                 <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter", isPositive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-red-500 bg-red-50 border-red-100")}>
                    {trend}
                 </span>
              </div>
            </div>
         </CardContent>
      </Card>
   );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CreditCard, Receipt, User, Calendar, Save, Printer, DollarSign, ChevronLeft, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getPatientById } from "@/app/actions/patients";
import { createInvoice } from "@/app/actions/billing";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  
  const [patient, setPatient] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "General Consultation", quantity: 1, unitPrice: 50.00 }
  ]);
  const [status, setStatus] = useState("unpaid");
  const [taxRate, setTaxRate] = useState(0.14); // 14% VAT
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patientId) {
      getPatientById(patientId).then(setPatient);
    }
  }, [patientId]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleIssueInvoice = async () => {
    if (!patientId) return alert("Please select a patient first.");
    setIsSubmitting(true);
    try {
      await createInvoice({
        patientId,
        items,
        subtotal,
        tax: taxAmount,
        total,
        status,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
      });
      router.push("/dashboard/billing");
    } catch (error) {
      console.error("Invoice creation failed:", error);
      alert("Failed to create invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (patientId && !patient) {
     return <div className="h-screen flex items-center justify-center animate-pulse font-black text-primary uppercase">Loading Billing Context...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm bg-white">
              <ChevronLeft className="h-5 w-5" />
           </button>
           <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-800">Generate Invoice</h2>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 italic">
                 <span>Billing for:</span>
                 <span className="font-black text-primary uppercase underline underline-offset-4 decoration-2">{patient?.fullName || 'Select Patient'}</span>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
           <button disabled={isSubmitting} className="inline-flex items-center px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50">
             <Printer className="mr-2 h-4 w-4" /> Save Draft
           </button>
           <button 
             disabled={!patientId || isSubmitting}
             onClick={handleIssueInvoice}
             className="inline-flex items-center px-8 py-2.5 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
           >
             <Save className="mr-2 h-4 w-4" /> 
             {isSubmitting ? 'Issuing...' : 'Finalize & Issue'}
           </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-none shadow-2xl ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4 px-6 font-semibold">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <Receipt className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Services & Procedures</CardTitle>
                 </div>
                 <button onClick={addItem} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-primary/5 transition-all">
                    <Plus className="h-3 w-3" /> Add Charge
                 </button>
              </CardHeader>
              <CardContent className="p-0">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/30 text-[9px] font-black uppercase text-slate-400 border-b tracking-[0.2em]">
                       <tr>
                          <th className="px-8 py-4">Description</th>
                          <th className="px-8 py-4 w-24 text-center">Qty</th>
                          <th className="px-8 py-4 w-32">Unit Price</th>
                          <th className="px-8 py-4 w-32">Total</th>
                          <th className="px-8 py-4 w-12 text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {items.map((item) => (
                         <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-5">
                               <input 
                                 value={item.description} 
                                 onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                 className="w-full bg-white border border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-lg p-2 font-black text-slate-700 outline-none transition-all placeholder:text-slate-200" 
                                 placeholder="Type service name (e.g. X-Ray, Lab Test)..." 
                               />
                            </td>
                            <td className="px-8 py-5">
                               <input 
                                 type="number"
                                 value={item.quantity} 
                                 onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                 className="w-full bg-white border border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-lg p-2 text-center font-black text-slate-700 outline-none transition-all" 
                               />
                            </td>
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-1 relative group/input">
                                  <span className="absolute left-3 text-slate-300 font-black text-xs">$</span>
                                  <input 
                                    type="number"
                                    value={item.unitPrice} 
                                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-lg pl-8 p-2 font-black text-slate-700 outline-none transition-all" 
                                  />
                               </div>
                            </td>
                            <td className="px-8 py-5 font-black text-slate-400">
                               ${(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                            <td className="px-8 py-5 text-right">
                               <button onClick={() => removeItem(item.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </CardContent>
           </Card>

           <div className="grid grid-cols-2 gap-8 font-semibold">
              <Card className="border-none shadow-xl ring-1 ring-slate-200">
                 <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                       <FileText className="h-3 w-3" /> Memo / Personal Note
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-4">
                    <textarea className="w-full text-xs min-h-[100px] border-slate-200 rounded-lg p-4 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-slate-600 bg-slate-50/30" placeholder="Notes for the patient or insurance billing..." />
                 </CardContent>
              </Card>
              <Card className="border-none shadow-xl ring-1 ring-slate-200">
                 <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                       <CreditCard className="h-3 w-3" /> Payment Terms
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                       {["unpaid", "partial", "paid"].map(s => (
                         <button 
                           key={s} 
                           onClick={() => setStatus(s)}
                           className={cn(
                             "flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest", 
                             status === s 
                               ? (s === 'unpaid' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : s === 'paid' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-primary text-white shadow-lg shadow-primary/20') 
                               : 'text-slate-400 hover:bg-white hover:text-slate-600'
                           )}
                         >
                            {s}
                         </button>
                       ))}
                    </div>
                    <div className="flex items-center justify-between text-xs font-black text-slate-500 group">
                       <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-300" /> 
                          <span className="uppercase tracking-widest">Due Date:</span>
                       </div>
                       <span className="text-slate-800 border-b-2 border-primary/20">26 March 2026</span>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-900 text-white overflow-hidden shadow-2xl border-none ring-4 ring-slate-900/5">
              <CardHeader className="border-b border-white/10 p-8">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Invoice Summary</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                 </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div className="flex justify-between text-sm group">
                       <span className="text-white/40 font-black uppercase tracking-widest">Subtotal</span>
                       <span className="font-mono font-black text-white/80 group-hover:text-white transition-colors tracking-tighter">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm group">
                       <span className="text-white/40 font-black uppercase tracking-widest">Tax (14%)</span>
                       <span className="font-mono font-black text-white/80 group-hover:text-white transition-colors tracking-tighter">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-8 border-t border-white/10 relative">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Grand Total</span>
                       <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black text-secondary/40">$</span>
                          <span className="text-5xl font-mono font-black text-secondary drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] tracking-tighter">{total.toFixed(2)}</span>
                       </div>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="bg-white/5 p-8 block border-t border-white/5">
                 <div className="flex items-center gap-3 text-[10px] text-secondary font-black uppercase tracking-widest mb-6">
                    <CreditCard className="h-4 w-4" /> 
                    Digital Receipting Active
                 </div>
                 <button className="w-full py-4 bg-secondary text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Generate & Send Link
                 </button>
              </CardFooter>
           </Card>

           <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-4">
                 <CardTitle className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Medical Context</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/5">
                       <User className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                       <div className="text-base font-black text-slate-800 leading-none">{patient?.fullName || 'N/A'}</div>
                       <div className="text-[10px] text-primary/60 font-black uppercase tracking-widest">MRN: {patient?.mrn || 'N/A'}</div>
                    </div>
                 </div>
                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                       <span className="text-slate-400">Linked Visit</span>
                       <span className="text-emerald-500">Live Connection</span>
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                       Consultation Visit • {new Date().toLocaleDateString()}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

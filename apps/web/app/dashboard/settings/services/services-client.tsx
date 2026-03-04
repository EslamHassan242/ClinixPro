"use client";

import { useState } from "react";
import { Plus, Search, DollarSign, Clock, MoreVertical, Edit2, Trash2, Activity, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createService, updateService, deleteService } from "@/app/actions/services";
import { useRouter } from "next/navigation";

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true,
  });

  const handleOpenModal = (service?: any) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        price: service.price,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
      } else {
        await createService(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
      try {
        await deleteService(id);
      } catch (error) {
        console.error("Failed to delete service:", error);
        alert("Failed to delete service. It may be linked to existing invoices.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl bg-white border-0 animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="border-b space-y-1 bg-slate-50/50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-slate-800">
                  {editingService ? "Edit Service" : "Add New Service"}
                </CardTitle>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Service Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Initial Consultation" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px]" placeholder="Details about this service..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price ($) *</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Duration (mins) *</label>
                    <input type="number" required value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                  </div>
                </div>
                {editingService && (
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Active Service</label>
                  </div>
                )}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                  <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                    {isSubmitting ? "Saving..." : editingService ? "Update" : "Create Service"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Clinic Services</h2>
          <p className="text-muted-foreground">Manage the services you offer, set pricing and appointment durations.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialServices.map((service) => (
          <Card key={service.id} className={cn("relative overflow-hidden group hover:shadow-lg transition-all border-l-4", service.isActive ? "border-l-primary/30 hover:border-l-primary" : "border-l-slate-300 opacity-60")}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Activity className="h-5 w-5" />
                 </div>
              </div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {service.name}
                {!service.isActive && <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Inactive</span>}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1 min-h-[16px]">{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-slate-600">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-lg font-black text-slate-800">${service.price.toFixed(2)}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" />
                    {service.duration} min
                 </div>
              </div>
              <div className="flex gap-2 pt-2">
                 <button onClick={() => handleOpenModal(service)} className="flex-1 inline-flex items-center justify-center rounded-md border py-2 text-xs font-bold hover:bg-slate-50 transition-all">
                    <Edit2 className="mr-2 h-3 w-3" /> Edit
                 </button>
                 <button onClick={() => handleDelete(service.id, service.name)} className="inline-flex items-center justify-center rounded-md border border-red-100 py-2 px-3 text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 className="h-3 w-3" />
                 </button>
              </div>
            </CardContent>
          </Card>
        ))}

        <button onClick={() => handleOpenModal()} className="flex flex-col items-center justify-center min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10">
               <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold">Add Another Service</span>
            <span className="text-[10px] text-muted-foreground mt-1">Pricing and duration will be required</span>
        </button>
      </div>
    </div>
  );
}

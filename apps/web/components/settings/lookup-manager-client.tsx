"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Pill, Microscope, Activity, Heart, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getLookups, createLookup, updateLookup, deleteLookup } from "@/app/actions/lookups";

const lookupTypes = [
  { id: "MEDICINE", label: "Medicines", icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "LAB_TEST", label: "Laboratory", icon: Microscope, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "RADIOLOGY", label: "Radiology", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "ORGAN", label: "Target Organs", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
];

export function LookupManagerClient() {
  const [activeType, setActiveType] = useState("MEDICINE");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", description: "", category: "" });

  useEffect(() => {
    fetchItems();
  }, [activeType]);

  async function fetchItems() {
    setIsLoading(true);
    try {
      const data = await getLookups(activeType);
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch lookups:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newItem.name) return;
    try {
      await createLookup({ ...newItem, type: activeType });
      setNewItem({ name: "", description: "", category: "" });
      setIsAdding(false);
      fetchItems();
    } catch (error) {
      alert("Failed to create item. Name might already exist.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteLookup(id);
      fetchItems();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  const activeInfo = lookupTypes.find(t => t.id === activeType)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Master Data (Lookups)</h2>
          <p className="text-slate-500 font-medium italic text-sm">Manage your clinic's catalog of medicines, lab tests, and more.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" /> Add {activeInfo.label.slice(0, -1)}
        </button>
      </div>

      <div className="flex gap-4 border-b pb-4 overflow-x-auto">
        {lookupTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 shrink-0",
              activeType === type.id 
                ? `border-primary ${type.bg} ${type.color} ring-4 ring-primary/5` 
                : "border-transparent text-slate-500 hover:bg-slate-50"
            )}
          >
            <type.icon className="h-5 w-5" />
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form (Desktop) */}
        <div className="lg:col-span-1 space-y-6">
          {isAdding && (
            <Card className="shadow-2xl border-none ring-1 ring-slate-200 bg-white">
              <CardHeader className={cn("border-b py-4", activeInfo.bg)}>
                <CardTitle className={cn("text-lg font-black flex items-center gap-2", activeInfo.color)}>
                   <Plus className="h-5 w-5" /> New {activeInfo.label.slice(0, -1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name / Label</label>
                    <input 
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={`e.g. ${activeType === 'MEDICINE' ? 'Amoxicillin' : activeType === 'LAB_TEST' ? 'CBC' : 'Liver'}`}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category (Optional)</label>
                    <input 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="e.g. Antibiotics, Blood Work"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                    <textarea 
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                      placeholder="Details about usage or default dosage..."
                    />
                 </div>
                 <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleCreate}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-600/20 hover:brightness-110 transition-all active:scale-95"
                    >
                      <Save className="h-4 w-4" /> Save Item
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="px-4 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </CardContent>
            </Card>
          )}

          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
             <div className="p-3 rounded-xl bg-white/10 w-fit">
                <activeInfo.icon className="h-8 w-8 text-primary" />
             </div>
             <h3 className="text-xl font-black">{activeInfo.label} Guide</h3>
             <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Populate this list to enable quick searching and selection during clinical sessions. 
                Doctors will be able to pick from this master list to generate professional prescriptions and requests.
             </p>
             <ul className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 space-y-2">
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" /> Faster Documentation</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" /> Standardized Names</li>
                <li className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-primary" /> Printable Reports</li>
             </ul>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${activeInfo.label.toLowerCase()}...`}
                  className="w-full bg-white border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
               {isLoading ? (
                 <div className="p-20 text-center animate-pulse font-black text-slate-200 tracking-widest uppercase text-xs">Loading Catalog...</div>
               ) : filteredItems.length === 0 ? (
                 <div className="p-20 text-center space-y-2">
                    <p className="text-slate-400 italic font-medium">No {activeInfo.label.toLowerCase()} found.</p>
                    <button onClick={() => setIsAdding(true)} className="text-primary font-black text-xs uppercase underline">Add the first one →</button>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {filteredItems.map(item => (
                      <div key={item.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-all">
                         <div className="flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 shadow-sm", activeInfo.bg, activeInfo.color)}>
                               <activeInfo.icon className="h-5 w-5" />
                            </div>
                            <div>
                               <div className="font-bold text-slate-800">{item.name}</div>
                               <div className="flex gap-2 mt-0.5">
                                  {item.category && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{item.category}</span>}
                                  {item.description && <span className="text-[10px] text-slate-400 font-medium line-clamp-1 italic">{item.description}</span>}
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                               <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

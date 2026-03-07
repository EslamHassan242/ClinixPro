"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Building2, Clock, MapPin, Globe, Phone, Mail, Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  getWorkingHours, 
  updateWorkingHours, 
  getClinicProfile, 
  updateClinicProfile,
  getHolidays,
  createHoliday,
  deleteHoliday
} from "@/app/actions/settings";
import { toast } from "sonner";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ClinicSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({ name: "", email: "", phone: "", address: "" });
  const [workingHours, setWorkingHours] = useState<any[]>(
    Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, isOpen: true, startTime: "09:00", endTime: "17:00" }))
  );
  const [holidays, setHolidays] = useState<any[]>([]);
  const [newHoliday, setNewHoliday] = useState({ name: "", date: "" });

  useEffect(() => {
    async function loadData() {
        try {
            const [p, wh, h] = await Promise.all([
                getClinicProfile(),
                getWorkingHours(),
                getHolidays()
            ]);
            if (p) setProfile(p);
            if (wh && wh.length > 0) {
                const mergedHours = Array.from({ length: 7 }, (_, i) => {
                    const found = wh.find(db => db.dayOfWeek === i);
                    return found ? { dayOfWeek: i, isOpen: found.isWorking, startTime: found.startTime, endTime: found.endTime } : { dayOfWeek: i, isOpen: true, startTime: "09:00", endTime: "17:00" };
                });
                setWorkingHours(mergedHours);
            }
            setHolidays(h || []);
        } catch (error) {
            toast.error("Failed to load clinic settings");
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
        await Promise.all([
            updateClinicProfile(profile),
            updateWorkingHours(workingHours.map(wh => ({
                dayOfWeek: wh.dayOfWeek,
                isOpen: wh.isOpen,
                startTime: wh.startTime,
                endTime: wh.endTime
            })))
        ]);
        toast.success("Settings saved successfully");
    } catch (error) {
        toast.error("Failed to save settings");
    } finally {
        setSaving(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!newHoliday.name || !newHoliday.date) return;
    try {
        const holiday = await createHoliday({ 
            name: newHoliday.name, 
            date: new Date(newHoliday.date) 
        });
        setHolidays([...holidays, holiday]);
        setNewHoliday({ name: "", date: "" });
        toast.success("Holiday added");
    } catch (error) {
        toast.error("Failed to add holiday");
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
        await deleteHoliday(id);
        setHolidays(holidays.filter(h => h.id !== id));
        toast.success("Holiday deleted");
    } catch (error) {
        toast.error("Failed to delete holiday");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Profile</h2>
          <p className="text-muted-foreground">Manage your clinic's public information and operational hours.</p>
        </div>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-md font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
           <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-8">
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">General Information</CardTitle>
                  <CardDescription>How your clinic appears to patients and in reports.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                     <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer">
                        <Upload className="h-6 w-6 mb-1" />
                        <span className="text-[8px] font-bold uppercase">Upload Logo</span>
                     </div>
                     <div className="flex-1 space-y-4">
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clinic Name</label>
                            <input 
                                className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="e.g. HealthCare Center" 
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tagline</label>
                            <input className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Your health is our priority" />
                         </div>
                      </div>
                   </div>
                   <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Mail className="h-3 w-3" /> Email</label>
                         <input 
                            type="email" 
                            className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                            value={profile.email || ""}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            placeholder="contact@clinic.com" 
                        />
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
                         <input 
                            className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                            value={profile.phone || ""}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            placeholder="+123456789" 
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</label>
                         <textarea 
                            className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[60px]" 
                            value={profile.address || ""}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            placeholder="Full physical address" 
                        />
                      </div>
                   </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Operational Hours</CardTitle>
                  <CardDescription>Define when your clinic is open for appointments.</CardDescription>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y">
                     {workingHours.map((wh, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                             <input 
                                type="checkbox" 
                                checked={wh.isOpen} 
                                onChange={(e) => {
                                   const newHours = [...workingHours];
                                   newHours[idx].isOpen = e.target.checked;
                                   setWorkingHours(newHours);
                                }}
                                 className="rounded text-primary focus:ring-primary" 
                              />
                              <span className={cn("text-sm font-bold w-24", wh.isOpen ? "text-foreground" : "text-slate-400")}>{dayNames[wh.dayOfWeek]}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              {wh.isOpen ? (
                                <>
                                  <input 
                                    type="time" 
                                    value={wh.startTime || "09:00"} 
                                    onChange={(e) => {
                                       const newHours = [...workingHours];
                                       newHours[idx].startTime = e.target.value;
                                       setWorkingHours(newHours);
                                    }}
                                    className="rounded border p-1 text-xs outline-none focus:border-primary transition-colors" 
                                  />
                                  <span className="text-slate-400">to</span>
                                  <input 
                                    type="time" 
                                    value={wh.endTime || "17:00"} 
                                    onChange={(e) => {
                                       const newHours = [...workingHours];
                                       newHours[idx].endTime = e.target.value;
                                       setWorkingHours(newHours);
                                    }}
                                    className="rounded border p-1 text-xs outline-none focus:border-primary transition-colors" 
                                  />
                                </>
                              ) : (
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Closed</span>
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>

             <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Clinic Holidays</CardTitle>
                  <CardDescription>Records of upcoming office closures and holidays.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="flex items-end gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Holiday Name</label>
                        <input 
                            className="w-full rounded-md border p-2 text-sm outline-none" 
                            placeholder="e.g. National Day" 
                            value={newHoliday.name}
                            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</label>
                        <input 
                            type="date" 
                            className="w-full rounded-md border p-2 text-sm outline-none" 
                            value={newHoliday.date}
                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        />
                    </div>
                    <button 
                        onClick={handleAddHoliday}
                        className="p-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {holidays.map((h, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-md">
                                    <CalendarIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{h.name}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(h.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteHoliday(h.id)}
                                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {holidays.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400 italic">No holidays configured.</p>
                    )}
                  </div>
               </CardContent>
             </Card>
         </div>

         <div className="space-y-8">
            <Card className="bg-primary/5 border-primary/20">
               <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Public Link</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <p className="text-xs text-slate-600">Your clinic is live at:</p>
                  <div className="flex items-center gap-2 p-3 bg-white border rounded text-xs font-mono text-primary font-bold shadow-sm">
                     <Globe className="h-4 w-4 shrink-0" />
                     healthcare.clinixpro.com
                  </div>
                  <button className="w-full py-2 bg-white border border-primary text-primary rounded-md text-xs font-bold hover:bg-primary hover:text-white transition-all">
                     View Public Profile
                  </button>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Storage Status</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between text-xs font-bold mb-1">
                     <span>4.2 GB used</span>
                     <span className="text-slate-400">of 10 GB</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: "42%" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Higher storage allows for more patient medical attachments and images.</p>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}

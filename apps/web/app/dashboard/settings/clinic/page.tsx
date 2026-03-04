"use client";

import { useState } from "react";
import { Save, Upload, Building2, Clock, MapPin, Globe, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ClinicSettingsPage() {
  const [workingHours, setWorkingHours] = useState(
    days.map(day => ({ day, isOpen: true, open: "09:00", close: "17:00" }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clinic Profile</h2>
          <p className="text-muted-foreground">Manage your clinic's public information and operational hours.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-md font-bold text-sm shadow-md hover:bg-primary/90">
           <Save className="h-4 w-4" /> Save Changes
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
                           <input className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. HealthCare Center" />
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
                        <input type="email" className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="contact@clinic.com" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</label>
                        <input className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="+123456789" />
                     </div>
                     <div className="col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</label>
                        <textarea className="w-full rounded-md border p-2 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[60px]" placeholder="Full physical address" />
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
                             <span className={cn("text-sm font-bold w-24", wh.isOpen ? "text-foreground" : "text-slate-400")}>{wh.day}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             {wh.isOpen ? (
                               <>
                                 <input 
                                   type="time" 
                                   value={wh.open} 
                                   onChange={(e) => {
                                      const newHours = [...workingHours];
                                      newHours[idx].open = e.target.value;
                                      setWorkingHours(newHours);
                                   }}
                                   className="rounded border p-1 text-xs outline-none focus:border-primary transition-colors" 
                                 />
                                 <span className="text-slate-400">to</span>
                                 <input 
                                   type="time" 
                                   value={wh.close} 
                                   onChange={(e) => {
                                      const newHours = [...workingHours];
                                      newHours[idx].close = e.target.value;
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

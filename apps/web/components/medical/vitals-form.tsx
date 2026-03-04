"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Thermometer, Wind, Heart, Weight, Ruler } from "lucide-react";

interface VitalsFormProps {
  vitals: any;
  onChange: (vitals: any) => void;
}

export function VitalsForm({ vitals = {}, onChange }: VitalsFormProps) {
  const updateVital = (key: string, value: string) => {
    onChange({ ...vitals, [key]: value });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Heart className="h-3 w-3 text-red-500" /> Blood Pressure
        </Label>
        <Input 
          placeholder="120/80" 
          value={vitals.bloodPressure || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("bloodPressure", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Activity className="h-3 w-3 text-emerald-500" /> Pulse (bpm)
        </Label>
        <Input 
          type="number"
          placeholder="72" 
          value={vitals.pulse || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("pulse", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Thermometer className="h-3 w-3 text-amber-500" /> Temp (°C)
        </Label>
        <Input 
          type="number"
          step="0.1"
          placeholder="37.0" 
          value={vitals.temperature || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("temperature", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Wind className="h-3 w-3 text-blue-500" /> Resp. Rate
        </Label>
        <Input 
          type="number"
          placeholder="18" 
          value={vitals.respiratoryRate || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("respiratoryRate", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Weight className="h-3 w-3 text-indigo-500" /> Weight (kg)
        </Label>
        <Input 
          type="number"
          placeholder="70" 
          value={vitals.weight || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("weight", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
           <Ruler className="h-3 w-3 text-teal-500" /> SpO2 (%)
        </Label>
        <Input 
          type="number"
          placeholder="98" 
          value={vitals.spo2 || ""} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVital("spo2", e.target.value)}
          className="bg-white border-2 border-slate-100 rounded-xl font-bold focus:border-primary transition-all"
        />
      </div>
    </div>
  );
}

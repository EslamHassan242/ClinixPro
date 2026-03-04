"use client";

import { useState } from "react";
// No Dialog imports needed anymore as we'll use a custom div-based modal

import { X, Camera, Save, Loader2, Microscope, Activity } from "lucide-react";
import { AttachmentManager } from "./attachment-manager";
import { updateInvestigationResult } from "@/app/actions/medical-records";
import { toast } from "sonner";

interface InvestigationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: any;
  onSuccess: () => void;
}

export function InvestigationResultModal({ isOpen, onClose, investigation, onSuccess }: InvestigationResultModalProps) {
  const [resultText, setResultText] = useState(investigation.results || "");
  const [images, setImages] = useState<string[]>(investigation.resultImageUrls || []);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!resultText && images.length === 0) {
      return toast.error("Please provide at least a result note or an image.");
    }

    setIsSaving(true);
    try {
      await updateInvestigationResult(investigation.id, resultText, images);
      toast.success("Results uploaded successfully!");
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Failed to save results.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${investigation.type === 'RADIOLOGY' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                {investigation.type === 'RADIOLOGY' ? <Activity className="h-5 w-5" /> : <Microscope className="h-5 w-5" />}
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{investigation.testName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recording Clinical Findings</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-8 no-scrollbar">
           <div className="space-y-3 font-medium text-slate-600 text-sm italic border-l-4 border-slate-200 pl-4 py-1">
              "Ordered for: {investigation.targetOrgan || 'General'} Checkup"
              {investigation.notes && <p className="text-xs text-slate-400 mt-1">Doctor's Note: {investigation.notes}</p>}
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Detailed Result Findings</label>
              <textarea 
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="Write your findings here... (e.g. Normal sinus rhythm, No fractures detected, etc.)"
                className="w-full h-32 p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none text-sm font-medium resize-none shadow-inner"
              />
           </div>

           <div className="space-y-4">
              <AttachmentManager onUpdate={setImages} initialUrls={images} />
           </div>
        </div>

        <div className="p-6 border-t bg-slate-50/50 flex items-center justify-between">
           <button onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-all">
              Cancel
           </button>
           <button 
             disabled={isSaving}
             onClick={handleSave}
             className="inline-flex items-center gap-2 px-10 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95"
           >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Complete Investigation
           </button>
        </div>
      </div>
    </div>
  );
}

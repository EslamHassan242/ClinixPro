"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, X, Paperclip, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
}

export function AttachmentManager({ onUpdate, initialUrls = [] }: { onUpdate: (urls: string[]) => void, initialUrls?: string[] }) {
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialUrls.map(url => ({
      id: Math.random().toString(36).substr(2, 9),
      url,
      name: url.split('/').pop() || 'result-image',
      type: 'image/jpeg'
    }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: Attachment[] = [];
    
    try {
        const { uploadMedicalFile } = await import("@/lib/supabase");
        const { compressImage } = await import("@/lib/image-utils");
        
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            const id = Math.random().toString(36).substr(2, 9);
            
            // Compress image if applicable
            if (file.type.startsWith('image/')) {
                try {
                    file = await compressImage(file);
                } catch (e) {
                    console.warn("Compression failed, uploading original:", e);
                }
            }
            
            // Upload to Supabase Storage
            const publicUrl = await uploadMedicalFile(file, "records");
            
            newAttachments.push({
                id,
                url: publicUrl,
                name: file.name,
                type: file.type
            });
        }

        const updated = [...attachments, ...newAttachments];
        setAttachments(updated);
        onUpdate(updated.map(a => a.url));
        toast.success(`Successfully uploaded ${files.length} file(s)`);
    } catch (error: any) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload files to cloud storage.");
    } finally {
        setIsUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id);
    setAttachments(updated);
    onUpdate(updated.map(a => a.url));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2 text-slate-800">
          <Paperclip className="h-5 w-5 text-primary" />
          Visit Attachments
        </h3>
        <div className="flex gap-2">
           <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">
             <Camera className="h-4 w-4" /> Take Photo
             <input 
               type="file" 
               accept="image/*" 
               capture="environment" 
               className="hidden" 
               onChange={handleFileChange}
               multiple
             />
           </label>
           <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
             <ImageIcon className="h-4 w-4" /> Upload Files
             <input 
               type="file" 
               accept="image/*,application/pdf" 
               className="hidden" 
               onChange={handleFileChange}
               multiple
             />
           </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {attachments.map((file) => (
          <div key={file.id} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm hover:ring-4 hover:ring-primary/10 transition-all">
             <img src={file.url} alt={file.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button 
                  onClick={() => removeAttachment(file.id)}
                  className="bg-white/20 hover:bg-red-500 p-2 rounded-full text-white backdrop-blur-md transition-all translate-y-4 group-hover:translate-y-0"
                >
                   <X className="h-5 w-5" />
                </button>
             </div>
             <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[8px] font-bold text-white truncate">{file.name}</p>
             </div>
          </div>
        ))}
        
        {isUploading && (
          <div className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2 animate-pulse">
             <Loader2 className="h-6 w-6 text-primary animate-spin" />
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading...</span>
          </div>
        )}

        {attachments.length === 0 && !isUploading && (
          <div className="col-span-full py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
             <Camera className="h-8 w-8 mb-2 opacity-20" />
             <p className="text-xs font-medium italic">No results attached. Use the camera to capture lab papers.</p>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
         <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{attachments.length} document(s) ready to be saved with this record</span>
         </div>
      )}
    </div>
  );
}

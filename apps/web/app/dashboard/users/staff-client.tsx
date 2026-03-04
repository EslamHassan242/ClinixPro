"use client";

import { useState } from "react";
import { MoreVertical, Mail, Phone, ShieldCheck, Edit2, X, UserCog } from "lucide-react";
import { updateStaffMember } from "@/app/actions/users";
import { useRouter } from "next/navigation";

const roleColors: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  doctor: "bg-blue-100 text-blue-700",
  nurse: "bg-emerald-100 text-emerald-700",
  receptionist: "bg-violet-100 text-violet-700",
  lab_tech: "bg-orange-100 text-orange-700",
};

export default function StaffClient({ staff }: { staff: any[] }) {
  const router = useRouter();
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    role: "doctor",
    phone: "",
    specialization: "",
    isActive: true,
  });

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleEditClick = (member: any) => {
    setEditingStaff(member);
    setFormData({
      fullName: member.fullName,
      role: member.role,
      phone: member.phone || "",
      specialization: member.specialization || "",
      isActive: member.isActive,
    });
    setOpenDropdownId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    
    setIsSubmitting(true);
    try {
      await updateStaffMember(editingStaff.id, formData);
      setEditingStaff(null);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update staff:", error);
      alert(error.message || "Failed to update staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Edit Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-4 bg-slate-50/50 rounded-t-xl">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Edit Staff Member
              </h3>
              <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">System Role</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab_tech">Lab Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              {formData.role === "doctor" && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Specialization</label>
                  <input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full rounded-lg border-slate-200 bg-slate-50/50 p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="e.g. Cardiologist" />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Account Active</label>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={() => setEditingStaff(null)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="overflow-x-auto relative min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] border-b">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Specialization</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  No staff members found. Add your first team member.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                        {member.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{member.fullName}</p>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[member.role] || "bg-slate-100 text-slate-600"}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {member.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {member.phone && (
                        <p className="flex items-center gap-1 text-xs text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {member.phone}
                        </p>
                      )}
                      {member.email && (
                        <p className="flex items-center gap-1 text-xs text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {member.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {member.specialization || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex h-2 w-2 rounded-full mr-2 ${member.isActive ? "bg-emerald-400" : "bg-slate-300"}`} />
                    <span className={`text-xs font-bold ${member.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === member.id ? null : member.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openDropdownId === member.id && (
                        <>
                           <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                           <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95">
                             <button
                               onClick={() => handleEditClick(member)}
                               className="w-full flex items-center px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                             >
                                <Edit2 className="mr-2 h-3 w-3" /> Edit Staff
                             </button>
                           </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

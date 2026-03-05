"use client";

import { useState } from "react";
import { Menu, X, Activity, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardClient({ profile, role, children }: { profile: any, role: string, children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={role as any} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b">
           <div className="flex items-center gap-2 font-bold text-primary">
              <Activity className="h-6 w-6" />
              <span className="text-xl tracking-tighter">ClinixPro</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
              <X className="h-6 w-6" />
           </button>
        </div>
        <Sidebar role={role as any} onItemClick={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8 bg-white z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
             <h1 className="text-sm lg:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 truncate">
               <span className="hidden sm:inline opacity-20">/</span> {profile.tenant.name}
               <span className="hidden sm:inline text-[8px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black shadow-sm shadow-primary/20">Clinic</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black uppercase text-slate-400 leading-none">Logged in as</span>
                <span className="text-xs font-bold text-slate-700 leading-tight">{profile.fullName}</span>
             </div>
             
             <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 border-2 border-slate-100 hover:border-primary/20 transition-colors shadow-sm cursor-pointer">
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                    {profile.fullName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 animate-in slide-in-from-top-2 duration-200">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{profile.fullName}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 focus:bg-slate-50 focus:text-primary cursor-pointer transition-colors font-bold text-xs uppercase tracking-tight">
                  <UserIcon className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 focus:bg-slate-50 focus:text-primary cursor-pointer transition-colors font-bold text-xs uppercase tracking-tight">
                  <SettingsIcon className="h-4 w-4" /> Layout Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-50" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer transition-colors font-black text-xs uppercase tracking-tight"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

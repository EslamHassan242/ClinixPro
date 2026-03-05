"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  CreditCard,
  Settings,
  Activity,
  UserCog,
  Microscope,
  Stethoscope,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "doctor" | "nurse" | "receptionist" | "lab_tech";
  onItemClick?: () => void;
}

const navigations = {
// ... existing navigations constant
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "/dashboard/queue", icon: Activity },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "Patients", href: "/dashboard/patients", icon: Users },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Staff", href: "/dashboard/users", icon: UserCog },
    { name: "Master Catalog", href: "/dashboard/settings/lookups", icon: ClipboardList },
    { name: "Services", href: "/dashboard/settings/services", icon: Stethoscope },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  doctor: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "/dashboard/queue", icon: Activity },
    { name: "My Schedule", href: "/dashboard/appointments", icon: Calendar },
    { name: "Patients", href: "/dashboard/patients", icon: Users },
    { name: "Prescriptions", href: "/dashboard/medical-records", icon: FileText },
    { name: "Lab Requests", href: "/dashboard/labs", icon: Microscope },
  ],
  receptionist: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "/dashboard/queue", icon: Activity },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "Register Patient", href: "/dashboard/patients/new", icon: Users },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ],
  nurse: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "/dashboard/queue", icon: Activity },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
    { name: "Patient Vitals", href: "/dashboard/patients", icon: Activity },
  ],
  lab_tech: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "/dashboard/queue", icon: Activity },
    { name: "Lab Tests", href: "/dashboard/labs", icon: Microscope },
  ],
};

export function Sidebar({ role, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = navigations[role] || navigations.receptionist;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 font-bold text-primary"
          onClick={onItemClick}
        >
          <Activity className="h-6 w-6" />
          <span className="text-xl">ClinixPro</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, CheckCircle2, KeyRound, X } from "lucide-react";

interface Props {
  name: string;
  email: string;
  password: string;
}

export default function CredentialsBanner({ name, email, password }: Props) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const copy = async (text: string, type: "email" | "password") => {
    await navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="relative rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-lg">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <KeyRound className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-emerald-800 mb-1">
            ✅ Account created for {name}
          </h3>
          <p className="text-xs text-emerald-700 mb-4">
            Share these login credentials directly with the staff member. They can change their password after first login.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between bg-white rounded-lg border border-emerald-200 px-4 py-2.5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                <p className="text-sm font-bold text-slate-700">{email}</p>
              </div>
              <button
                onClick={() => copy(email, "email")}
                className="ml-3 p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                {copiedEmail ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between bg-white rounded-lg border border-emerald-200 px-4 py-2.5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temp Password</p>
                <p className="text-sm font-bold text-slate-700 font-mono">{password}</p>
              </div>
              <button
                onClick={() => copy(password, "password")}
                className="ml-3 p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                {copiedPassword ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-emerald-600 italic">
            ⚠️ This message will disappear when you leave this page. Make sure to copy the credentials first.
          </p>
        </div>
      </div>
    </div>
  );
}

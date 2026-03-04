'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
        <h2 className="text-2xl font-black text-red-600 mb-4 uppercase tracking-tight">Application Error</h2>
        <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100 overflow-auto max-h-64">
          <p className="text-sm font-mono text-red-800 break-all whitespace-pre-wrap">
            {error.message || 'An unknown error occurred'}
          </p>
          {error.digest && (
            <p className="mt-2 text-[10px] text-red-400">Digest: {error.digest}</p>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          Try again
        </button>
        <p className="mt-6 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          ClinixPro Diagnostic Mode
        </p>
      </div>
    </div>
  );
}

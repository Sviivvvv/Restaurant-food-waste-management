import React from "react";
import { Link } from "react-router-dom";
import { FaceFrownIcon } from "@heroicons/react/24/solid";

// simple fallback page shown when a route does not match anything
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
      <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
        <FaceFrownIcon className="h-[22px] w-[22px]" />
      </div>
      <p className="text-3xl font-bold text-slate-300">404</p>
      <p className="text-slate-500">This page does not exist.</p>
      <Link to="/" className="text-brand-600 font-medium hover:underline">Go back home</Link>
    </div>
  );
}

import React from "react";

// color themes a stat card can use for its icon circle, keeps the palette consistent
const tone_styles = {
  rose: "bg-rose-50 text-rose-600",
  brand: "bg-brand-50 text-brand-700",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700"
};

// small card used on the dashboard to show one summary number, with an icon and optional tone color
export default function StatCard({ label, value, icon: Icon, tone = "slate" }) {
  return (
    <div className="card flex items-center gap-4">
      {Icon && (
        <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${tone_styles[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold mt-0.5 text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

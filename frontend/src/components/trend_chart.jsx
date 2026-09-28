import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format_currency } from "../utils/format_currency.js";

// line chart showing daily monetary loss over time, used on the manager dashboard
export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">No trend data yet for this filter.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => format_currency(value)} />
        <Line type="monotone" dataKey="total_loss" stroke="#0d9488" strokeWidth={2} name="Loss (LKR)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

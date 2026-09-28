import React from "react";
import Sidebar from "./sidebar.jsx";

// shared shell for every logged in page: sidebar on the left, scrollable content on the right
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

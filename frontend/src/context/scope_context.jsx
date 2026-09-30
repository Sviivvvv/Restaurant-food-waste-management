import React, { createContext, useContext, useEffect, useState } from "react";

const ScopeContext = createContext({ scoped_branch_id: null, set_scoped_branch_id: () => {} });

// shares which branch the current page is filtered to, so the top bar can show its name and status.
// Pages with a branch filter (dashboard, all entries) report it; every other page leaves it empty.
export function ScopeProvider({ children }) {
  const [scoped_branch_id, set_scoped_branch_id] = useState(null);
  return <ScopeContext.Provider value={{ scoped_branch_id, set_scoped_branch_id }}>{children}</ScopeContext.Provider>;
}

export function useScope() {
  return useContext(ScopeContext);
}

// hook for pages with a branch filter: keeps the top bar in sync and clears it when the page closes
export function useReportBranchScope(branch_id) {
  const { set_scoped_branch_id } = useScope();
  useEffect(() => {
    set_scoped_branch_id(branch_id || null);
  }, [branch_id, set_scoped_branch_id]);
  useEffect(() => () => set_scoped_branch_id(null), [set_scoped_branch_id]);
}

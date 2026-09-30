import React, { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

// Shared search, newest-first ordering, and pagination for every list table in the app.
// Filtering and paging happen in the browser on the rows the page already loaded, which keeps
// the API unchanged; get_search_text returns the strings a row should be searchable by.
export function useTableControls(rows, get_search_text, page_size = 10) {
  const [query, set_query] = useState("");
  const [page, set_page] = useState(1);

  // newest first, using the createdAt timestamp every collection already records
  const sorted = useMemo(
    () => [...(rows || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [rows]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sorted;
    return sorted.filter((row) =>
      get_search_text(row)
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
    // get_search_text is an inline function on each page, so only the data and query drive this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, query]);

  // a new search always starts from the first page
  useEffect(() => set_page(1), [query]);

  const page_count = Math.max(1, Math.ceil(filtered.length / page_size));
  const current_page = Math.min(page, page_count);
  const start = (current_page - 1) * page_size;

  return {
    query,
    set_query,
    page: current_page,
    set_page,
    page_count,
    page_size,
    total: filtered.length,
    has_rows: sorted.length > 0,
    page_rows: filtered.slice(start, start + page_size)
  };
}

// search box shown at the top of a table card, with a live result count on the right
export function TableSearch({ table, placeholder = "Search..." }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="relative w-full max-w-xs">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          className="input-field py-2 pl-9"
          placeholder={placeholder}
          value={table.query}
          onChange={(e) => table.set_query(e.target.value)}
        />
      </div>
      <p className="shrink-0 text-xs text-slate-400">
        {table.total} {table.total === 1 ? "result" : "results"}
      </p>
    </div>
  );
}

// message shown in place of the rows when a search matches nothing
export function NoSearchResults({ table }) {
  return <p className="py-10 text-center text-sm text-slate-400">No results for "{table.query}".</p>;
}

// page numbers to show: always the first and last, plus the current page and its neighbours
function visible_pages(current, count) {
  const pages = new Set([1, count, current - 1, current, current + 1]);
  return [...pages].filter((number) => number >= 1 && number <= count).sort((a, b) => a - b);
}

// "Showing 11-20 of 57" on the left, previous / page numbers / next on the right
export function TablePagination({ table }) {
  if (table.total === 0) return null;
  const first = (table.page - 1) * table.page_size + 1;
  const last = Math.min(table.page * table.page_size, table.total);
  const pages = visible_pages(table.page, table.page_count);

  return (
    <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{first}–{last}</span> of{" "}
        <span className="font-medium text-slate-700">{table.total}</span>
      </p>
      {table.page_count > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="page-button"
            disabled={table.page === 1}
            onClick={() => table.set_page(table.page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          {pages.map((number, index) => (
            <React.Fragment key={number}>
              {index > 0 && number - pages[index - 1] > 1 && <span className="px-1 text-xs text-slate-400">…</span>}
              <button
                type="button"
                className={number === table.page ? "page-button-active" : "page-button"}
                onClick={() => table.set_page(number)}
              >
                {number}
              </button>
            </React.Fragment>
          ))}
          <button
            type="button"
            className="page-button"
            disabled={table.page === table.page_count}
            onClick={() => table.set_page(table.page + 1)}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

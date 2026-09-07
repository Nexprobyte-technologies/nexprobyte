import React, { useEffect, useState } from "react";

// Reusable pagination controls bar
export function Pagination({ page, pageCount, total, onPage, style, from, to }) {
  if (total <= 1) return null;
  if (from === undefined || to === undefined) {
    from = (page - 1) * 10 + 1;
    to = Math.min(page * 10, total);
  }
  return (
    <div
      className="paces-card"
      style={{
        marginTop: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        ...style,
      }}
    >
      <div style={{ fontSize: 12.5, color: "var(--p-text-muted)" }}>
        Showing {from}–{to} of {total}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          className="paces-btn paces-btn-outline paces-btn-sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          ‹ Prev
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`paces-btn paces-btn-sm ${page === n ? "paces-btn-coral" : "paces-btn-outline"}`}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          className="paces-btn paces-btn-outline paces-btn-sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

// Hook: returns current page, the sliced data, pageCount, and a reset. Default 10/page.
export function usePagination(list = [], pageSize = 10) {
  const [page, setPage] = useState(1);
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = list.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return {
    page: safePage,
    pageCount,
    total,
    paged,
    setPage,
    go: (p) => setPage(p),
    reset: () => setPage(1),
    rendered: paged,
    totalPages: pageCount,
    pageStart: (safePage - 1) * pageSize + 1,
    pageEnd: Math.min(safePage * pageSize, total),
  };
}

export default Pagination;
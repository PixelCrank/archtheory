"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useSharedFilters } from "@/hooks/useSharedFilters";
import { SiteNav } from "./SiteNav";
import { EraLegend } from "./EraLegend";
import { Breadcrumb } from "./Breadcrumb";
import type { MacroMovement, ChildMovement } from "@/lib/timelineData";

export function ViewShell({
  active,
  macros,
  movements,
  count,
  countLabel,
  viewSpecific,
  children,
}: {
  active: "gallery" | "timeline" | "map";
  macros: MacroMovement[];
  movements: ChildMovement[];
  count?: number;
  countLabel?: string;
  viewSpecific?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { filters, setFilters } = useSharedFilters();
  const [localQuery, setLocalQuery] = useState(filters.query);
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounce local query → shared filter
  useEffect(() => {
    const t = setTimeout(() => {
      if (localQuery !== filters.query) setFilters({ query: localQuery });
    }, 200);
    return () => clearTimeout(t);
  }, [localQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync if filter.query changes externally (back/forward nav)
  useEffect(() => {
    if (filters.query !== localQuery) setLocalQuery(filters.query);
  }, [filters.query]); // eslint-disable-line react-hooks/exhaustive-deps

  // "/" focuses search; Escape clears selection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setFilters({ selectedId: "" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Movements filtered to selected era for the dropdown
  const eraMovements = useMemo(() => {
    if (!filters.eraId) return movements;
    const macro = macros.find((m) => m.id === filters.eraId);
    if (!macro) return movements;
    return movements.filter((m) => (macro.children ?? []).includes(m.id));
  }, [movements, macros, filters.eraId]);

  const hasFilters = Boolean(
    filters.query || filters.eraId || filters.movementId
  );

  const clearAll = () => {
    setLocalQuery("");
    setFilters({ query: "", eraId: "", movementId: "", selectedId: "" });
  };

  return (
    <main className="view-shell">
      <SiteNav active={active} />

      {/* Controls bar — two rows */}
      <div className="view-controls-bar" role="search" aria-label="Filter">
        {/* Row 1: era pills */}
        <div className="view-era-row">
          <EraLegend
            macros={macros}
            selectedId={filters.eraId}
            onSelect={(id) => setFilters({ eraId: id, movementId: "" })}
          />
        </div>

        {/* Row 2: search · movement · view-specific controls · count + clear */}
        <div className="view-controls-row">
          <label className="view-search">
            <Search size={15} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search buildings, architects, places…"
              aria-label="Search"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  setFilters({ query: "" });
                }}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
            <kbd aria-hidden="true">/</kbd>
          </label>

          <select
            value={filters.movementId}
            onChange={(e) => setFilters({ movementId: e.target.value })}
            aria-label="Filter by movement"
            className="view-select"
          >
            <option value="">All movements</option>
            {eraMovements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {viewSpecific}

          <div className="view-count-group">
            {count !== undefined && (
              <span
                className="view-count"
                aria-live="polite"
                aria-atomic="true"
              >
                {count}
                {countLabel ? ` ${countLabel}` : ""}
              </span>
            )}
            {hasFilters && (
              <button type="button" className="view-clear" onClick={clearAll}>
                <X size={13} aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb — visible when era or movement filter is active */}
      <div className="view-breadcrumb">
        <Breadcrumb macros={macros} movements={movements} />
      </div>

      {/* Content — fills remaining viewport height */}
      <div className="view-content">{children}</div>
    </main>
  );
}

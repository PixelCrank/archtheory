"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SharedFilters {
  query: string;      // search query → URL param "q"
  eraId: string;      // macro era ID → URL param "era"  (empty = all)
  movementId: string; // movement ID → URL param "movement" (empty = all)
  selectedId: string; // selected building/figure ID → URL param "building"
}

const EVENT_NAME = "sharedfilters:change";

function readFromWindow(): SharedFilters {
  if (typeof window === "undefined") {
    return { query: "", eraId: "", movementId: "", selectedId: "" };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    query: p.get("q") ?? "",
    eraId: p.get("era") ?? "",
    movementId: p.get("movement") ?? "",
    selectedId: p.get("building") ?? "",
  };
}

export function useSharedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFiltersState] = useState<SharedFilters>(() =>
    readFromWindow()
  );

  // Keep a ref so setFilters can read current state without being in its dep array
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Sync from other hook instances (programmatic filter changes) and back/forward nav
  useEffect(() => {
    const onEvent = (e: Event) => {
      const next = (e as CustomEvent<SharedFilters>).detail;
      setFiltersState(next);
    };
    const onPop = () => setFiltersState(readFromWindow());

    window.addEventListener(EVENT_NAME, onEvent);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(EVENT_NAME, onEvent);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const setFilters = useCallback(
    (updates: Partial<SharedFilters>) => {
      const next = { ...filtersRef.current, ...updates };

      // Build URL
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.eraId) params.set("era", next.eraId);
      if (next.movementId) params.set("movement", next.movementId);
      if (next.selectedId) params.set("building", next.selectedId);
      const qs = params.toString();

      // Update this instance immediately
      setFiltersState(next);

      // Broadcast to every other hook instance on the page
      window.dispatchEvent(new CustomEvent<SharedFilters>(EVENT_NAME, { detail: next }));

      // Persist to URL
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  // Build cross-view nav URL preserving era/movement/query but NOT selectedId
  const buildViewHref = useCallback(
    (targetPath: string) => {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      if (filters.eraId) params.set("era", filters.eraId);
      if (filters.movementId) params.set("movement", filters.movementId);
      const qs = params.toString();
      return `${targetPath}${qs ? `?${qs}` : ""}`;
    },
    [filters]
  );

  return { filters, setFilters, buildViewHref };
}

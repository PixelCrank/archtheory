"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useTimelineData } from "@/hooks/useTimelineData";
import { useSharedFilters } from "@/hooks/useSharedFilters";
import type { ChildMovement, MacroMovement, TimelineBuilding } from "@/lib/timelineData";
import { ERA_COLORS } from "./palettes";
import { ViewShell } from "./ViewShell";
import { DetailPanel } from "./DetailPanel";
import { HoverPreview } from "./HoverPreview";

// ── Pure utilities ────────────────────────────────────────────────────────────
function parseYear(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/-?\d{1,4}/);
  return match ? Number(match[0]) : undefined;
}

function formatYear(value?: string): string {
  const y = parseYear(value);
  if (y === undefined) return value || "Date unknown";
  return y < 0 ? `${Math.abs(y)} BCE` : String(y);
}

function movementRange(m: ChildMovement): [number, number] {
  const s = m.start ?? 0;
  return [s, m.end ?? s + 50];
}

function buildingYear(b: TimelineBuilding, m: ChildMovement): number {
  const y = parseYear(b.yearsBuilt);
  if (y === undefined) return m.start ?? 0;
  const [s, e] = movementRange(m);
  return [y, -y].find((c) => c >= s && c <= e) ?? y;
}

function movementFocusRange(movement: ChildMovement): [number, number] {
  const [start, end] = movementRange(movement);
  const buildingYears = (movement.works ?? []).map((building) => buildingYear(building, movement));
  return [Math.min(start, ...buildingYears), Math.max(end, ...buildingYears)];
}

// ── Clustering ────────────────────────────────────────────────────────────────
interface ClusterItem {
  building: TimelineBuilding;
  movement: ChildMovement;
  year: number;
}
interface Cluster {
  id: string;
  startYear: number;
  centerYear: number;
  items: ClusterItem[];
}

interface TimelineFocus {
  id: string;
  start: number;
  end: number;
}

const TIMELINE_LABEL_WIDTH = 180;

function clusterEntries(
  entries: ClusterItem[],
  minYear: number,
  maxYear: number,
  totalPx: number,
  nodeSize: number,
): Cluster[] {
  if (!entries.length || totalPx <= 0 || maxYear <= minYear) return [];
  const pxPerYear = totalPx / (maxYear - minYear);
  const threshold = (nodeSize + 6) / pxPerYear;

  const sorted = [...entries].sort((a, b) => a.year - b.year);
  const clusters: Cluster[] = [];

  for (const e of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && e.year - last.startYear <= threshold) {
      last.items.push(e);
      last.centerYear = last.items.reduce((s, i) => s + i.year, 0) / last.items.length;
    } else {
      clusters.push({ id: e.building.id, startYear: e.year, centerYear: e.year, items: [e] });
    }
  }
  return clusters;
}

// ── Dimension helpers ─────────────────────────────────────────────────────────
interface ZoomDims {
  nodeSize: number;
  bandPad: number;
  eraKeyH: number;
  showLabel: boolean;
}

function getZoomDims(colW: number): ZoomDims {
  const nodeSize = Math.max(12, Math.min(38, Math.round(colW * 0.46)));
  const bandPad = nodeSize < 22 ? 3 : 8;
  const eraKeyH = colW <= 40 ? 22 : 30;
  const showLabel = nodeSize >= 22;
  return { nodeSize, bandPad, eraKeyH, showLabel };
}

// ── Types ─────────────────────────────────────────────────────────────────────
type HoverInfo = {
  building: TimelineBuilding;
  movement: ChildMovement;
  color: string;
  anchorX: number;
  anchorY: number;
} | null;

// ── ClusterNode ───────────────────────────────────────────────────────────────
function ClusterNode({
  cluster, color, nodeLeft, dims, expandedId, onSelectBuilding, onHover,
}: {
  cluster: Cluster;
  color: string;
  nodeLeft: string;
  dims: ZoomDims;
  expandedId: string | null;
  onSelectBuilding: (id: string) => void;
  onHover: (info: HoverInfo) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { nodeSize, showLabel } = dims;
  const { items } = cluster;
  const isSingle = items.length === 1;
  const isExpanded = items.some((i) => i.building.id === expandedId);
  const cardW = nodeSize + 6;

  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popoverOpen]);

  const handleClick = () => {
    if (isSingle) {
      onSelectBuilding(items[0].building.id);
    } else {
      setPopoverOpen((o) => !o);
    }
  };

  const visualStyle: React.CSSProperties = {
    width: nodeSize,
    height: nodeSize,
    borderColor: color,
    background: color,
    fontSize: Math.max(8, Math.round(nodeSize * 0.36)),
    borderWidth: nodeSize < 22 ? 1 : 2,
    ...(isExpanded ? { outline: `2px solid ${color}`, outlineOffset: "2px" } : {}),
  };

  const yearRange =
    items.length > 1
      ? `${formatYear(String(Math.round(Math.min(...items.map((i) => i.year)))))}–${formatYear(String(Math.round(Math.max(...items.map((i) => i.year)))))}`
      : formatYear(items[0].building.yearsBuilt);

  return (
    <article
      ref={ref}
      className="timeline-building"
      style={{ left: nodeLeft, width: cardW }}
      onMouseEnter={(e) => {
        if (!isSingle) return;
        const r = e.currentTarget.getBoundingClientRect();
        onHover({
          building: items[0].building,
          movement: items[0].movement,
          color,
          anchorX: r.left + r.width / 2,
          anchorY: r.top,
        });
      }}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        className="timeline-building-node"
        style={{ width: cardW }}
        onClick={handleClick}
        aria-expanded={isSingle ? isExpanded : popoverOpen}
        aria-label={
          isSingle
            ? `${items[0].building.name || "building"}, ${yearRange}`
            : `${items.length} buildings clustered, ${yearRange}`
        }
      >
        <span className="timeline-node-visual" style={visualStyle}>
          {isSingle ? (
            items[0].building.imageUrl
              ? <img src={items[0].building.imageUrl} alt="" loading="lazy" />
              : <span>{(items[0].building.name || "?")[0]}</span>
          ) : (
            <span className="timeline-cluster-count">{items.length}</span>
          )}
        </span>
        {showLabel && (
          <span className="timeline-node-year">
            {isSingle ? formatYear(items[0].building.yearsBuilt) : `${items.length} works`}
          </span>
        )}
      </button>

      {!isSingle && popoverOpen && (
        <div className="timeline-cluster-popover" role="listbox" aria-label="Buildings in cluster">
          <div className="timeline-cluster-popover-header">
            <span style={{ color }}>{items.length} works · {yearRange}</span>
          </div>
          {items.map(({ building, movement }) => (
            <button
              key={building.id}
              type="button"
              role="option"
              aria-selected={building.id === expandedId}
              className={`timeline-cluster-item${building.id === expandedId ? " active" : ""}`}
              onClick={() => { onSelectBuilding(building.id); setPopoverOpen(false); }}
            >
              <span className="timeline-cluster-dot" style={{ background: color }} />
              <span className="timeline-cluster-name">{building.name || "Untitled"}</span>
              <span className="timeline-cluster-year">{formatYear(building.yearsBuilt)}</span>
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

// ── EraBand ───────────────────────────────────────────────────────────────────
function EraBand({
  childMovements, color, expandedId, onToggle, onFocusMovement, focusedMovementId,
  minYear, maxYear, totalPx, onHover, stacked, layerH,
  dims, bandH,
}: {
  childMovements: Array<{ movement: ChildMovement; buildings: TimelineBuilding[] }>;
  color: string;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onFocusMovement: (movement: ChildMovement) => void;
  focusedMovementId: string | null;
  minYear: number;
  maxYear: number;
  totalPx: number;
  onHover: (info: HoverInfo) => void;
  stacked: boolean;
  layerH: number;
  dims: ZoomDims;
  bandH: number;
}) {
  const { nodeSize, eraKeyH, bandPad } = dims;

  const yearSpan = Math.max(1, maxYear - minYear);
  const pct = (y: number) => `${Math.max(0, Math.min(100, ((y - minYear) / yearSpan) * 100))}%`;
  const widthPct = (m: ChildMovement) => {
    const [s, e] = movementRange(m);
    return `${Math.max(0.5, Math.min(100, ((e - s) / yearSpan) * 100))}%`;
  };

  const entries: ClusterItem[] = childMovements.flatMap(({ movement, buildings }) =>
    buildings.map((b) => ({ building: b, movement, year: buildingYear(b, movement) }))
  );

  const renderMovementLayer = (
    movement: ChildMovement,
    buildings: TimelineBuilding[],
    height: number
  ) => {
    const movementEntries = buildings.map((building) => ({
      building,
      movement,
      year: buildingYear(building, movement),
    }));
    const clusters = clusterEntries(movementEntries, minYear, maxYear, totalPx, nodeSize);
    const trackH = height - eraKeyH;

    return (
      <div className="timeline-submovement-layer" style={{ height }} key={movement.id}>
        <div className="timeline-era-key" style={{ height: eraKeyH }}>
          <button
            type="button"
            className={focusedMovementId === movement.id ? "timeline-movement-focus" : undefined}
            onClick={() => onFocusMovement(movement)}
            aria-label={`Focus timeline on ${movement.name}, ${movement.start ?? "unknown"} to ${movement.end ?? "present"}`}
            style={{
              position: "absolute",
              borderColor: color,
              left: pct(movementRange(movement)[0]),
              width: widthPct(movement),
              zIndex: 100000 - (movementRange(movement)[1] - movementRange(movement)[0]),
              boxSizing: "border-box",
            }}
          >
            <i style={{ background: color }} />
            {movement.name}
            <small>{buildings.length}</small>
          </button>
        </div>
        <div style={{ position: "relative", height: trackH, display: "flex", alignItems: "center" }}>
          {clusters.map((cluster) => (
            <ClusterNode
              key={cluster.id}
              cluster={cluster}
              color={color}
              nodeLeft={pct(cluster.centerYear)}
              dims={dims}
              expandedId={expandedId}
              onSelectBuilding={onToggle}
              onHover={onHover}
            />
          ))}
        </div>
      </div>
    );
  };

  if (stacked) {
    return (
      <section className="timeline-era-band timeline-era-band--stacked" style={{ height: bandH }}>
        {childMovements.map(({ movement, buildings }) => renderMovementLayer(movement, buildings, layerH))}
      </section>
    );
  }

  const clusters = clusterEntries(entries, minYear, maxYear, totalPx, nodeSize);
  const trackH = bandH - eraKeyH;

  return (
    <section className="timeline-era-band" style={{ height: bandH }}>
      <div className="timeline-era-key" style={{ height: eraKeyH }}>
        {childMovements.map(({ movement, buildings }) => (
          <button
            key={movement.id}
            type="button"
            className={focusedMovementId === movement.id ? "timeline-movement-focus" : undefined}
            onClick={() => onFocusMovement(movement)}
            aria-label={`Focus timeline on ${movement.name}, ${movement.start ?? "unknown"} to ${movement.end ?? "present"}`}
            style={{
              position: "absolute",
              borderColor: color,
              left: pct(movementRange(movement)[0]),
              width: widthPct(movement),
              zIndex: 100000 - (movementRange(movement)[1] - movementRange(movement)[0]),
              boxSizing: "border-box",
            }}
          >
            <i style={{ background: color }} />
            {movement.name}
            <small>{buildings.length}</small>
          </button>
        ))}
      </div>

      <div style={{ position: "relative", height: trackH, display: "flex", alignItems: "center" }}>
        {clusters.map((cluster) => (
          <ClusterNode
            key={cluster.id}
            cluster={cluster}
            color={color}
            nodeLeft={pct(cluster.centerYear)}
            dims={dims}
            expandedId={expandedId}
            onSelectBuilding={onToggle}
            onHover={onHover}
          />
        ))}
      </div>
    </section>
  );
}

// ── TimelineV2 ────────────────────────────────────────────────────────────────
export function TimelineV2() {
  const { data, loading, error } = useTimelineData();
  const { filters, setFilters } = useSharedFilters();
  const [columnWidth, setColumnWidth] = useState(72);
  const [hoverCard, setHoverCard] = useState<HoverInfo>(null);
  const [focusedMovementId, setFocusedMovementId] = useState<string | null>(null);
  const [availH, setAvailH] = useState(0);
  const gridShellRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Measure available height for band distribution
  useEffect(() => {
    const el = gridShellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setAvailH(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const macros = useMemo<MacroMovement[]>(() => data?.macros ?? [], [data]);
  const movements = useMemo<ChildMovement[]>(() => data?.children ?? [], [data]);
  const movementMap = useMemo(() => new Map(movements.map((m) => [m.id, m])), [movements]);

  const globalRanges = useMemo(() => {
    const vals = movements.flatMap((m) => movementRange(m));
    return {
      min: Math.floor(Math.min(...vals, 0) / 100) * 100,
      max: Math.ceil(Math.max(...vals, 2020) / 100) * 100,
    };
  }, [movements]);

  const ranges = useMemo(() => {
    const movement = filters.movementId ? movementMap.get(filters.movementId) : undefined;
    if (!movement) return globalRanges;

    const [start, end] = movementFocusRange(movement);
    const padding = Math.max(4, Math.min(25, (end - start) * 0.1));
    return {
      min: Math.floor((start - padding) / 10) * 10,
      max: Math.ceil((end + padding) / 10) * 10,
    };
  }, [filters.movementId, globalRanges, movementMap]);

  const decades = useMemo(() => {
    const result: number[] = [];
    const span = ranges.max - ranges.min;
    const iv = span > 3000 ? 100 : span > 500 ? 50 : span > 120 ? 25 : 10;
    for (let y = Math.floor(ranges.min / iv) * iv; y <= ranges.max; y += iv) result.push(y);
    return result;
  }, [ranges]);

  const maxColumnWidth = Math.max(
    128,
    Math.ceil(((ranges.max - ranges.min) * 44) / decades.length / 16) * 16
  );

  const timelineInterval = decades.length > 1 ? decades[1] - decades[0] : 100;

  const scrollToFocus = useCallback((focus: TimelineFocus, width: number) => {
    const scroll = timelineScrollRef.current;
    if (!scroll) return;
    const totalWidth = decades.length * width;
    const center = TIMELINE_LABEL_WIDTH + ((focus.start + focus.end) / 2 - ranges.min) / (ranges.max - ranges.min) * totalWidth;
    scroll.scrollTo({ left: Math.max(0, center - scroll.clientWidth / 2), behavior: "smooth" });
  }, [decades.length, ranges.max, ranges.min]);

  const focusTimeline = useCallback((id: string, start: number, end: number) => {
    const span = Math.max(1, end - start);
    const padding = Math.max(4, Math.min(25, span * 0.1));
    const focus = {
      id,
      start: Math.max(ranges.min, start - padding),
      end: Math.min(ranges.max, end + padding),
    };
    const viewportWidth = timelineScrollRef.current?.clientWidth ?? 900;
    const usableWidth = viewportWidth * 0.84;
    const targetWidth = Math.min(
      maxColumnWidth,
      Math.max(28, Math.ceil((usableWidth * timelineInterval / Math.max(1, focus.end - focus.start)) / 4) * 4)
    );
    setFocusedMovementId(id);
    setColumnWidth(targetWidth);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToFocus(focus, targetWidth));
    });
  }, [maxColumnWidth, ranges.max, ranges.min, scrollToFocus, timelineInterval]);

  useEffect(() => {
    if (filters.movementId) {
      const movement = movementMap.get(filters.movementId);
      if (movement) focusTimeline(movement.id, ...movementFocusRange(movement));
      return;
    }
    if (filters.eraId) {
      const macro = macros.find((item) => item.id === filters.eraId);
      if (macro) focusTimeline(macro.id, macro.start ?? ranges.min, macro.end ?? ranges.max);
      return;
    }
    setFocusedMovementId(null);
  }, [filters.movementId, filters.eraId, focusTimeline, macros, movementMap, ranges.max, ranges.min]);

  const dims = useMemo(() => getZoomDims(columnWidth), [columnWidth]);
  const totalPx = decades.length * columnWidth;
  const axisLabelEvery = columnWidth <= 40 ? 5 : columnWidth <= 72 ? 2 : 1;

  const zoomTimeline = useCallback((direction: 1 | -1, anchorX?: number) => {
    const scroll = timelineScrollRef.current;
    if (!scroll || totalPx <= 0) return;
    const currentAnchorX = anchorX ?? scroll.clientWidth / 2;
    const datePosition = Math.max(
      0,
      Math.min(1, (scroll.scrollLeft + currentAnchorX - TIMELINE_LABEL_WIDTH) / totalPx)
    );
    const scaledWidth = Math.round((columnWidth * (direction > 0 ? 1.25 : 0.8)) / 4) * 4;
    const nextWidth = direction > 0
      ? Math.max(columnWidth + 4, Math.min(maxColumnWidth, scaledWidth))
      : Math.min(columnWidth - 4, Math.max(28, scaledWidth));
    if (nextWidth === columnWidth) return;
    const nextTotalPx = decades.length * nextWidth;
    setColumnWidth(nextWidth);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroll.scrollTo({
          left: Math.max(0, TIMELINE_LABEL_WIDTH + datePosition * nextTotalPx - currentAnchorX),
          behavior: "smooth",
        });
      });
    });
  }, [columnWidth, decades.length, maxColumnWidth, totalPx]);

  const handleTimelineWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    zoomTimeline(event.deltaY < 0 ? 1 : -1, event.clientX - rect.left);
  }, [zoomTimeline]);

  // Main filter: era → movement → search
  const visibleMacros = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return macros
      .map((macro, i) => {
        const childMovements = (macro.children ?? [])
          .map((id) => movementMap.get(id))
          .filter((m): m is ChildMovement => Boolean(m))
          .filter((m) => !filters.movementId || m.id === filters.movementId)
          .map((m) => ({
            movement: m,
            buildings: (m.works ?? []).filter((b) =>
              !q ||
              [b.name, b.description, b.architects, b.location]
                .filter(Boolean).join(" ").toLowerCase().includes(q)
            ),
          }))
          .filter(({ buildings }) => buildings.length > 0);
        return { macro, macroIndex: i, childMovements };
      })
      .filter(
        ({ macro, childMovements }) =>
          (!filters.eraId || macro.id === filters.eraId) && childMovements.length > 0
      );
  }, [macros, movementMap, filters.query, filters.eraId, filters.movementId]);

  const matchingCount = visibleMacros.reduce(
    (t, { childMovements }) => t + childMovements.reduce((s, { buildings }) => s + buildings.length, 0),
    0
  );

  // Fixed per-band height — single row, no stacking
  const AXIS_ROW_H = 46;
  const { nodeSize, eraKeyH, bandPad, showLabel } = dims;
  const naturalBandH = eraKeyH + bandPad + nodeSize + (showLabel ? 12 : 0) + bandPad;
  const numBands = visibleMacros.length;
  const stackSubmovements = Boolean(filters.eraId && !filters.movementId && visibleMacros.length === 1);
  const stackedMovementCount = stackSubmovements ? visibleMacros[0]?.childMovements.length ?? 1 : 1;

  const bandH = useMemo(() => {
    if (stackSubmovements) return naturalBandH * stackedMovementCount;
    if (!availH || !numBands) return naturalBandH;
    const usableH = availH - AXIS_ROW_H;
    const total = naturalBandH * numBands;
    if (total <= usableH) return naturalBandH;
    const compressed = Math.floor(usableH / numBands);
    return Math.max(eraKeyH + nodeSize + 6, compressed);
  }, [availH, numBands, naturalBandH, eraKeyH, nodeSize, stackSubmovements, stackedMovementCount]);

  // Resolve expanded building
  const expandedInfo = useMemo(() => {
    if (!filters.selectedId) return null;
    for (let i = 0; i < macros.length; i++) {
      for (const movId of (macros[i].children ?? [])) {
        const movement = movementMap.get(movId);
        if (!movement) continue;
        const b = (movement.works ?? []).find((b) => b.id === filters.selectedId);
        if (b) return { building: b, movement, color: ERA_COLORS[i % ERA_COLORS.length] };
      }
    }
    return null;
  }, [filters.selectedId, macros, movementMap]);

  const hasFilters = Boolean(filters.query || filters.eraId || filters.movementId);
  const resetTimeline = () => {
    setFocusedMovementId(null);
    setColumnWidth(72);
    timelineScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };
  const clearAll = () => {
    resetTimeline();
    setFilters({ query: "", eraId: "", movementId: "", selectedId: "" });
  };

  // Zoom controls — passed to ViewShell as viewSpecific
  const zoomControls = (
    <div className="timeline-zoom" aria-label="Timeline zoom">
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        onClick={() => zoomTimeline(-1)}
        disabled={columnWidth === 28}
      >
        <ZoomOut size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={() => zoomTimeline(1)}
        disabled={columnWidth === maxColumnWidth}
      >
        <ZoomIn size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="timeline-zoom-reset"
        title="Reset zoom"
        aria-label="Reset zoom"
        onClick={resetTimeline}
        disabled={columnWidth === 72 && !focusedMovementId}
      >
        <RotateCcw size={13} aria-hidden="true" />
      </button>
      {focusedMovementId && (
        <span className="timeline-focus-label" aria-live="polite">
          {movementMap.get(focusedMovementId)?.name ?? macros.find((macro) => macro.id === focusedMovementId)?.name}
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <ViewShell active="timeline" macros={[]} movements={[]} viewSpecific={zoomControls}>
        <div className="timeline-status" role="status" aria-live="polite">
          <div className="timeline-skeleton-wrap" aria-hidden="true">
            {[80, 60, 90, 50].map((w, i) => (
              <div key={i} className="timeline-skeleton-band">
                <div className="skeleton" style={{ width: `${w}%`, height: 14 }} />
                <div className="timeline-skeleton-nodes">
                  {Array.from({ length: Math.round(w / 20) }).map((_, j) => (
                    <div key={j} className="skeleton timeline-skeleton-node" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24 }}>Loading the archive…</p>
        </div>
      </ViewShell>
    );
  }

  if (error) {
    return (
      <ViewShell active="timeline" macros={[]} movements={[]} viewSpecific={zoomControls}>
        <div className="timeline-status" role="alert">
          <p>Could not load the timeline.</p>
          <small>{error}</small>
        </div>
      </ViewShell>
    );
  }

  return (
    <ViewShell
      active="timeline"
      macros={macros}
      movements={movements}
      count={matchingCount}
      countLabel="works"
      viewSpecific={zoomControls}
    >
      {/* Timeline grid — fills remaining viewport height */}
      <section
        ref={gridShellRef}
        className="timeline-grid-shell"
        aria-label="Architecture timeline"
      >
        <div
          ref={timelineScrollRef}
          className="timeline-grid-scroll"
          onWheel={handleTimelineWheel}
        >
          {visibleMacros.length === 0 ? (
            <div className="timeline-empty-state" role="status">
              <p>No works match your search</p>
              {hasFilters && (
                <>
                  <small>Try broadening your filters or clearing the search.</small>
                  <button type="button" onClick={clearAll}>
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div
              className="timeline-grid"
              style={{
                width: `${180 + totalPx}px`,
                gridTemplateColumns: `180px repeat(${decades.length}, ${columnWidth}px)`,
              }}
            >
              {/* Axis header */}
              <div className="timeline-corner">ERA / PERIOD</div>
              {decades.map((d, i) => (
                <div
                  key={d}
                  className={`timeline-decade ${i % axisLabelEvery !== 0 ? "timeline-decade-quiet" : ""}`}
                >
                  {i % axisLabelEvery === 0 ? (d < 0 ? `${Math.abs(d)} BCE` : d) : ""}
                </div>
              ))}

              {/* Era rows */}
              {visibleMacros.map(({ macro, macroIndex, childMovements }) => {
                const color = ERA_COLORS[macroIndex % ERA_COLORS.length];
                return (
                  <div
                    key={macro.id}
                    className="timeline-era-row"
                    style={{ gridColumn: `1 / span ${decades.length + 1}` }}
                  >
                    <div
                      className="timeline-era-label"
                      style={{ borderLeftColor: color, minHeight: bandH }}
                    >
                      <p className="timeline-era-label-name">
                        <span style={{ background: color }} aria-hidden="true" />
                        <strong>{macro.name}</strong>
                      </p>
                      <small>
                        {macro.start !== undefined
                          ? macro.start < 0
                            ? `${Math.abs(macro.start)} BCE`
                            : macro.start
                          : "?"}
                        {" – "}
                        {macro.end !== undefined
                          ? macro.end < 0
                            ? `${Math.abs(macro.end)} BCE`
                            : macro.end
                          : "present"}
                      </small>
                    </div>
                    <div className="timeline-era-content" style={{ width: `${totalPx}px` }}>
                      <EraBand
                        childMovements={childMovements}
                        color={color}
                        expandedId={filters.selectedId || null}
                        onToggle={(id) =>
                          setFilters({ selectedId: filters.selectedId === id ? "" : id })
                        }
                        onFocusMovement={(movement) =>
                          focusTimeline(movement.id, ...movementFocusRange(movement))
                        }
                        focusedMovementId={focusedMovementId}
                        stacked={stackSubmovements}
                        layerH={naturalBandH}
                        minYear={ranges.min}
                        maxYear={ranges.max}
                        totalPx={totalPx}
                        onHover={setHoverCard}
                        dims={dims}
                        bandH={bandH}
                      />
                      <div className="timeline-grid-lines" aria-hidden="true">
                        {decades.map((d) => <span key={d} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hover preview */}
      {hoverCard && (
        <HoverPreview
          item={hoverCard.building}
          movementName={hoverCard.movement.name}
          color={hoverCard.color}
          anchorX={hoverCard.anchorX}
          anchorY={hoverCard.anchorY}
          placement="above"
        />
      )}

      {/* Detail panel */}
      {expandedInfo && (
        <DetailPanel
          item={expandedInfo.building}
          movement={expandedInfo.movement}
          color={expandedInfo.color}
          onClose={() => setFilters({ selectedId: "" })}
          crossLinkView="gallery"
        />
      )}
    </ViewShell>
  );
}

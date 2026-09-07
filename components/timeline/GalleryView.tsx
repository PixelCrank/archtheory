"use client";

import { useMemo, useEffect, useRef } from "react";
import { useSharedFilters } from "@/hooks/useSharedFilters";
import { DetailPanel } from "./DetailPanel";
import { ERA_COLORS } from "./palettes";
import type { ChildMovement, MacroMovement, TimelineBuilding, TimelineFigure } from "@/lib/timelineData";

type ContentType = "buildings" | "figures";
type CardItem = TimelineBuilding | TimelineFigure;

function formatYear(value?: string): string {
  if (!value) return "";
  const match = value.replace(/,/g, "").match(/-?\d{1,4}/);
  if (!match) return value;
  const y = Number(match[0]);
  return y < 0 ? `${Math.abs(y)} BCE` : String(y);
}

function GalleryCard({
  item,
  movementName,
  color,
  selected,
  onClick,
}: {
  item: CardItem;
  movementName?: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  const isBuilding = item.type === "work";
  const building = isBuilding ? (item as TimelineBuilding) : null;
  const figure = !isBuilding ? (item as TimelineFigure) : null;
  const year = formatYear(building?.yearsBuilt) || (figure?.lifeDates ?? "");
  const location = building?.location ?? figure?.nationality ?? "";
  const initial = (item.name || "?")[0].toUpperCase();

  return (
    <article
      className={`gallery-card${selected ? " gallery-card--selected" : ""}`}
      aria-label={[item.name, year, location, movementName].filter(Boolean).join(" · ")}
    >
      <button
        type="button"
        className="gallery-card-btn"
        onClick={onClick}
        aria-expanded={selected}
      >
        <div className="gallery-card-image">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" loading="lazy" />
          ) : (
            <div
              className="gallery-card-placeholder"
              aria-hidden="true"
              style={{ background: `${color}18` }}
            >
              <span style={{ color }}>{initial}</span>
            </div>
          )}
          <div
            className="gallery-card-stripe"
            aria-hidden="true"
            style={{ background: color }}
            title={movementName}
          />
        </div>
        <div className="gallery-card-body">
          <h3 className="gallery-card-name">{item.name || "Untitled"}</h3>
          {location && <p className="gallery-card-location">{location}</p>}
          <div className="gallery-card-meta">
            {year && <span className="gallery-card-year">{year}</span>}
            {movementName && (
              <span className="gallery-card-movement" style={{ color }}>
                {movementName}
              </span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}

export function GallerySkeleton() {
  return (
    <div className="gallery-skeleton-grid" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="gallery-card-skeleton">
          <div className="skeleton skeleton-image" />
          <div className="gallery-card-skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-sub" />
            <div className="skeleton skeleton-meta" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GalleryView({
  macros,
  movements,
  contentType,
  onCountChange,
  error,
  onRetry,
}: {
  macros: MacroMovement[];
  movements: ChildMovement[];
  contentType: ContentType;
  onCountChange?: (count: number) => void;
  error?: string | null;
  onRetry?: () => void;
}) {
  const { filters, setFilters } = useSharedFilters();

  // Keep onCountChange ref stable so the effect deps stay clean
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const sortedMacros = useMemo(
    () =>
      [...macros]
        .filter((m) => m.name !== "Unclassified works")
        .sort((a, b) => (a.start ?? 0) - (b.start ?? 0)),
    [macros]
  );

  // movement → color + macroId
  const movementMeta = useMemo(() => {
    const map = new Map<string, { color: string; macroId: string }>();
    sortedMacros.forEach((macro, i) => {
      const color = ERA_COLORS[i % ERA_COLORS.length];
      (macro.children ?? []).forEach((movId) =>
        map.set(movId, { color, macroId: macro.id })
      );
    });
    return map;
  }, [sortedMacros]);

  // Flat list of all items with resolved context
  const allItems = useMemo(() => {
    return movements.flatMap((movement) => {
      const items =
        contentType === "buildings"
          ? ((movement.works ?? []) as CardItem[])
          : ((movement.figures ?? []) as CardItem[]);
      const meta = movementMeta.get(movement.id);
      return items.map((item) => ({
        item,
        movement,
        color: meta?.color ?? "#6e6e73",
        macroId: meta?.macroId ?? "",
      }));
    });
  }, [movements, contentType, movementMeta]);

  // Apply filters: era AND movement AND query
  const filteredItems = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return allItems.filter(({ item, movement, macroId }) => {
      if (filters.eraId && macroId !== filters.eraId) return false;
      if (filters.movementId && movement.id !== filters.movementId) return false;
      if (q) {
        const building = item.type === "work" ? (item as TimelineBuilding) : null;
        const figure = item.type === "figure" ? (item as TimelineFigure) : null;
        const text = [
          item.name,
          building?.architects,
          building?.location,
          building?.description,
          figure?.nationality,
          figure?.description,
          movement.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [allItems, filters]);

  // Notify parent of current count after every render cycle where it changes
  useEffect(() => {
    onCountChangeRef.current?.(filteredItems.length);
  }, [filteredItems.length]);

  // Resolve selected item
  const selectedEntry = useMemo(
    () =>
      filters.selectedId
        ? (filteredItems.find(({ item }) => item.id === filters.selectedId) ??
          null)
        : null,
    [filteredItems, filters.selectedId]
  );

  const hasFilters = Boolean(filters.query || filters.eraId || filters.movementId);

  const clearAll = () =>
    setFilters({ query: "", eraId: "", movementId: "", selectedId: "" });

  if (error) {
    return (
      <div className="gallery-view">
        <div className="gallery-error" role="alert">
          <p>Could not load the archive.</p>
          <small>{error}</small>
          {onRetry && (
            <button type="button" onClick={onRetry} className="gallery-retry-btn">
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-view">
      {filteredItems.length === 0 ? (
        <div className="gallery-empty" role="status">
          <p>No {contentType} match your filters</p>
          {hasFilters && (
            <>
              <small>Try broadening your search or clearing a filter.</small>
              <button type="button" onClick={clearAll}>
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="gallery-grid" aria-label={`${contentType} gallery`}>
          {filteredItems.map(({ item, movement, color }) => (
            <li key={item.id}>
              <GalleryCard
                item={item}
                movementName={movement.name}
                color={color}
                selected={filters.selectedId === item.id}
                onClick={() =>
                  setFilters({
                    selectedId:
                      filters.selectedId === item.id ? "" : item.id,
                  })
                }
              />
            </li>
          ))}
        </ul>
      )}

      {selectedEntry && (
        <DetailPanel
          item={selectedEntry.item}
          movement={selectedEntry.movement}
          color={selectedEntry.color}
          onClose={() => setFilters({ selectedId: "" })}
          crossLinkView="timeline"
        />
      )}
    </div>
  );
}

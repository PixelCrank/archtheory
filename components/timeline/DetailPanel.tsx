"use client";

import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import type { TimelineBuilding, TimelineFigure, ChildMovement } from "@/lib/timelineData";

type DetailItem = TimelineBuilding | TimelineFigure;

function isBuilding(item: DetailItem): item is TimelineBuilding {
  return item.type === "work";
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="detail-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Tags({ label, items }: { label: string; items?: string[] }) {
  const clean = items?.filter(Boolean);
  if (!clean?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="detail-section-label">{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {clean.map((tag, i) => (
          <span key={i} className="detail-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export function DetailPanel({
  item,
  movement,
  color = "var(--apple-blue)",
  onClose,
  crossLinkView = "timeline",
}: {
  item: DetailItem;
  movement?: ChildMovement | null;
  color?: string;
  onClose: () => void;
  crossLinkView?: "gallery" | "timeline";
}) {
  const building = isBuilding(item) ? item : null;
  const figure = !isBuilding(item) ? (item as TimelineFigure) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(0,0,0,0.18)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="detail-panel"
        style={{ borderTopColor: color }}
        aria-label={`Details: ${item.name || "Selected item"}`}
        role="complementary"
      >
        {/* Header */}
        <div className="detail-panel-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className="detail-panel-eyebrow" style={{ color }}>
              {movement?.name ?? ""}
              {building?.yearsBuilt ? ` · ${building.yearsBuilt}` : ""}
              {figure?.lifeDates ? ` · ${figure.lifeDates}` : ""}
            </p>
            <h2 className="detail-panel-title">
              {item.name || (building ? "Untitled work" : "Unknown figure")}
            </h2>
            {building?.location && (
              <p className="detail-panel-subtitle">{building.location}</p>
            )}
            {figure?.nationality && (
              <p className="detail-panel-subtitle">{figure.nationality}</p>
            )}
          </div>
          <button
            type="button"
            className="detail-close-btn"
            onClick={onClose}
            aria-label="Close detail panel"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="detail-panel-body">
          {/* Hero image */}
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={`${item.name} — architectural photograph`}
              className="detail-hero-image"
              loading="lazy"
            />
          )}

          {/* Description */}
          {(building?.extendedDescription || building?.description || figure?.description) && (
            <p className="detail-description">
              {building?.extendedDescription || building?.description || figure?.description}
            </p>
          )}

          {/* Building fields — only renders fields with content */}
          {building && (
            <dl className="detail-fields">
              <Field label="Architect" value={building.architects} />
              <Field label="Location" value={building.location} />
              <Field label="Year built" value={building.yearsBuilt} />
              <Field label="Materials" value={building.materialsText} />
              <Field label="Function" value={building.functionType} />
              <Field label="Patron" value={building.patron} />
              <Field label="Symbolism" value={building.symbolismText} />
              <Field label="Status" value={building.currentStatus} />
              <Field label="Sources" value={building.sources} />
            </dl>
          )}

          {/* Figure fields */}
          {figure && (
            <dl className="detail-fields">
              <Field label="Life dates" value={figure.lifeDates} />
              <Field label="Nationality" value={figure.nationality} />
              <Field label="Education" value={figure.education} />
              <Field label="Philosophy" value={figure.philosophy} />
              <Field label="Aesthetics" value={figure.aesthetics} />
              <Field label="Influence" value={figure.influence} />
              <Field label="Notes" value={figure.notes} />
              <Field label="Sources" value={figure.sources} />
            </dl>
          )}

          {/* Tags */}
          <Tags label="Materials" items={building?.materials} />
          <Tags label="Unique features" items={building?.uniqueFeatures} />
          <Tags label="Major works" items={figure?.majorWorks} />
          <Tags label="Key writings" items={figure?.keyWritings} />

          {/* Cross-link buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
            {crossLinkView === "timeline" && building && (
              <Link
                href={`/timeline?building=${encodeURIComponent(item.id)}`}
                className="detail-crosslink"
              >
                View on Timeline <ExternalLink size={13} aria-hidden="true" />
              </Link>
            )}
            {crossLinkView === "gallery" && (
              <Link
                href={`/gallery?building=${encodeURIComponent(item.id)}`}
                className="detail-crosslink"
              >
                View in Gallery <ExternalLink size={13} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

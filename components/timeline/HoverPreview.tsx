"use client";

import type { TimelineBuilding, TimelineFigure } from "@/lib/timelineData";

type HoverItem = TimelineBuilding | TimelineFigure;

function formatYear(value?: string): string {
  if (!value) return "";
  const match = value.replace(/,/g, "").match(/-?\d{1,4}/);
  if (!match) return value;
  const y = Number(match[0]);
  return y < 0 ? `${Math.abs(y)} BCE` : String(y);
}

export interface HoverPreviewProps {
  item: HoverItem;
  movementName?: string;
  color?: string;        // era accent color
  anchorX: number;       // viewport X of the anchor point (center of dot/card)
  anchorY: number;       // viewport Y of the anchor point (top of dot for above, center for right)
  placement?: "above" | "right";
}

export function HoverPreview({
  item,
  movementName,
  color = "var(--apple-blue)",
  anchorX,
  anchorY,
  placement = "above",
}: HoverPreviewProps) {
  // Compute position
  const CARD_W = 220;
  const CARD_H_APPROX = item.imageUrl ? 220 : 90; // approximate, avoids reflow
  const MARGIN = 12;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  let left = 0;
  let top = 0;
  let transform = "";

  if (placement === "above") {
    // Center horizontally on anchor, sit above
    left = Math.min(Math.max(MARGIN, anchorX - CARD_W / 2), vw - CARD_W - MARGIN);
    top = anchorY - 8;
    transform = "translateY(-100%)";
  } else {
    // Right of anchor
    const wouldOverflowRight = anchorX + 16 + CARD_W > vw - MARGIN;
    left = wouldOverflowRight ? anchorX - CARD_W - 12 : anchorX + 16;
    top = Math.min(Math.max(MARGIN, anchorY - CARD_H_APPROX / 2), vh - CARD_H_APPROX - MARGIN);
    transform = "";
  }

  const building = item.type === "work" ? (item as TimelineBuilding) : null;
  const figure = item.type === "figure" ? (item as TimelineFigure) : null;
  const year = formatYear(building?.yearsBuilt) || (figure?.lifeDates ?? "");
  const location = building?.location ?? figure?.nationality ?? "";
  const meta = [year, location].filter(Boolean).join(" · ");

  return (
    <div
      className="hover-preview"
      role="tooltip"
      style={{ left, top, transform }}
      aria-hidden="true"
    >
      {item.imageUrl && (
        <img
          className="hover-preview-image"
          src={item.imageUrl}
          alt=""
          loading="lazy"
        />
      )}
      <div className="hover-preview-body">
        <p className="hover-preview-title">{item.name || "Untitled"}</p>
        {meta && <p className="hover-preview-meta">{meta}</p>}
        {movementName && (
          <p className="hover-preview-movement" style={{ color }}>
            {movementName}
          </p>
        )}
      </div>
    </div>
  );
}

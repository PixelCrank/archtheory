"use client";

import { useState } from "react";
import { useTimelineData } from "@/hooks/useTimelineData";
import { ViewShell } from "@/components/timeline/ViewShell";
import { GalleryView, GallerySkeleton } from "@/components/timeline/GalleryView";
import { SiteNav } from "@/components/timeline/SiteNav";
import type { ChildMovement, MacroMovement } from "@/lib/timelineData";

export default function GalleryPage() {
  const { data, loading, error } = useTimelineData();
  const [count, setCount] = useState(0);
  const [contentType, setContentType] = useState<"buildings" | "figures">(
    "buildings"
  );

  const macros = (data?.macros ?? []) as MacroMovement[];
  const movements = (data?.children ?? []) as ChildMovement[];

  if (loading) {
    return (
      <main className="view-shell">
        <SiteNav active="gallery" />
        <div className="timeline-status" role="status" aria-live="polite">
          <GallerySkeleton />
        </div>
      </main>
    );
  }

  const viewSpecific = (
    <div className="view-type-toggle" role="group" aria-label="Content type">
      <button
        type="button"
        className={contentType === "buildings" ? "active" : ""}
        onClick={() => setContentType("buildings")}
        aria-pressed={contentType === "buildings"}
      >
        Buildings
      </button>
      <button
        type="button"
        className={contentType === "figures" ? "active" : ""}
        onClick={() => setContentType("figures")}
        aria-pressed={contentType === "figures"}
      >
        Figures
      </button>
    </div>
  );

  return (
    <ViewShell
      active="gallery"
      macros={macros}
      movements={movements}
      count={count}
      countLabel={contentType}
      viewSpecific={viewSpecific}
    >
      <GalleryView
        macros={macros}
        movements={movements}
        contentType={contentType}
        onCountChange={setCount}
        error={error}
      />
    </ViewShell>
  );
}

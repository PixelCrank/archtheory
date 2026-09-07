"use client";

import dynamic from "next/dynamic";
import { useTimelineData } from "@/hooks/useTimelineData";
import { ViewShell } from "@/components/timeline/ViewShell";
import { SiteNav } from "@/components/timeline/SiteNav";
import type { ChildMovement, MacroMovement, TimelineBuilding } from "@/lib/timelineData";

const MapView = dynamic(
  () => import("@/components/timeline/MapView").then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => <div className="map-loading map-fill">Loading world map…</div>,
  }
);

export default function MapPage() {
  const { data, loading, error } = useTimelineData();
  const macros = (data?.macros ?? []) as MacroMovement[];
  const movements = (data?.children ?? []) as ChildMovement[];
  const buildings = movements.flatMap((m) => m.works ?? []) as TimelineBuilding[];

  if (loading) {
    return (
      <main className="view-shell">
        <SiteNav active="map" />
        <div className="timeline-status">
          <div className="timeline-spinner" />
          <p>Loading the archive…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="view-shell">
        <SiteNav active="map" />
        <div className="timeline-status" role="alert">
          <p>Could not load the map.</p>
          <small>{error}</small>
        </div>
      </main>
    );
  }

  return (
    <ViewShell active="map" macros={macros} movements={movements}>
      <MapView buildings={buildings} movements={movements} macros={macros} />
    </ViewShell>
  );
}

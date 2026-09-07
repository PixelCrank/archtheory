"use client";

import Link from "next/link";
import { Grid3x3, Map, Rows3 } from "lucide-react";
import { useSharedFilters } from "@/hooks/useSharedFilters";

export function SiteNav({ active }: { active: "gallery" | "timeline" | "map" }) {
  const { buildViewHref } = useSharedFilters();

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <Link href="/" className="site-nav-brand">
        <span className="site-nav-brand-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="0" y="0" width="5" height="5" fill="currentColor" opacity="1" />
            <rect x="7" y="0" width="5" height="5" fill="currentColor" opacity="0.5" />
            <rect x="0" y="7" width="5" height="5" fill="currentColor" opacity="0.5" />
            <rect x="7" y="7" width="5" height="5" fill="currentColor" opacity="0.25" />
          </svg>
        </span>
        Architecture Through Time
      </Link>

      <div className="site-nav-links">
        <Link
          href={buildViewHref("/gallery")}
          className={active === "gallery" ? "active" : ""}
          aria-current={active === "gallery" ? "page" : undefined}
        >
          <Grid3x3 size={14} aria-hidden="true" />
          <span>Gallery</span>
        </Link>
        <Link
          href={buildViewHref("/timeline")}
          className={active === "timeline" ? "active" : ""}
          aria-current={active === "timeline" ? "page" : undefined}
        >
          <Rows3 size={14} aria-hidden="true" />
          <span>Timeline</span>
        </Link>
        <Link
          href={buildViewHref("/map")}
          className={active === "map" ? "active" : ""}
          aria-current={active === "map" ? "page" : undefined}
        >
          <Map size={14} aria-hidden="true" />
          <span>Map</span>
        </Link>
      </div>
    </nav>
  );
}

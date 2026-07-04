"use client";

import { useEffect } from "react";
import L from "leaflet";
import type { IssueClusterRow } from "@/types";
import { formatCategory } from "@/lib/format";

interface ClusterMapProps {
  clusters: IssueClusterRow[];
  defaultLatitude: number;
  defaultLongitude: number;
  defaultZoom: number;
}

const severityColor: Record<string, string> = {
  low: "#2f855a",
  medium: "#b7791f",
  high: "#c05621",
  critical: "#c53030"
};

export default function ClusterMap({ clusters, defaultLatitude, defaultLongitude, defaultZoom }: ClusterMapProps) {
  useEffect(() => {
    const container = document.getElementById("cluster-map");
    if (!container) return;
    container.replaceChildren();

    const map = L.map(container).setView([defaultLatitude, defaultLongitude], defaultZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const markers = clusters.map((cluster) => {
      const marker = L.circleMarker([cluster.center_latitude, cluster.center_longitude], {
        radius: Math.max(9, Math.min(24, cluster.report_count + 7)),
        color: severityColor[cluster.severity],
        fillColor: severityColor[cluster.severity],
        fillOpacity: 0.72,
        weight: 2
      }).addTo(map);
      marker.bindPopup(`
        <strong>${formatCategory(cluster.category)}</strong><br />
        Priority ${cluster.priority_score} / 100<br />
        ${cluster.report_count} reports<br />
        ${cluster.assigned_department || "Unassigned"}
      `);
      return marker;
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 15 });
    }

    return () => {
      map.remove();
    };
  }, [clusters, defaultLatitude, defaultLongitude, defaultZoom]);

  return <div id="cluster-map" className="map" />;
}

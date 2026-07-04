"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Camera, Crosshair, Loader2, MapPin, Send } from "lucide-react";
import { formatCategory, formatSeverity } from "@/lib/format";
import { notifyDataChanged } from "@/lib/useDataRefresh";
import type { IssueClusterRow, ReportRow, ClassificationResult, DemoUser } from "@/types";

const defaultLatitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || 9.9252);
const defaultLongitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || 78.1198);

const demoLocations = [
  { name: "Madurai Meenakshi Temple", latitude: 9.9195, longitude: 78.1193 },
  { name: "Madurai Mattuthavani", latitude: 9.9636, longitude: 78.1532 },
  { name: "Chennai T Nagar", latitude: 13.0418, longitude: 80.2341 },
  { name: "Coimbatore Gandhipuram", latitude: 11.0183, longitude: 76.9725 },
  { name: "Bengaluru Majestic", latitude: 12.9767, longitude: 77.5713 },
  { name: "Hyderabad Charminar", latitude: 17.3616, longitude: 78.4747 },
  { name: "Mumbai Dadar", latitude: 19.0178, longitude: 72.8478 },
  { name: "Delhi Connaught Place", latitude: 28.6315, longitude: 77.2167 },
  { name: "Kolkata Esplanade", latitude: 22.5646, longitude: 88.3433 },
  { name: "Kochi Marine Drive", latitude: 9.9816, longitude: 76.2773 },
  { name: "Jaipur Badi Chaupar", latitude: 26.9221, longitude: 75.8267 },
  { name: "Ahmedabad Manek Chowk", latitude: 23.0234, longitude: 72.5880 }
];

interface SubmitResult {
  classification: ClassificationResult;
  report: ReportRow;
  cluster: IssueClusterRow;
  matchedExistingCluster: boolean;
}

export default function ReportPage() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("Large pothole near school gate");
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationName, setLocationName] = useState("Madurai default");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);

  useEffect(() => {
    const stored = localStorage.getItem("demoUser");
    setUser(stored ? JSON.parse(stored) : null);
  }, []);

  function setDemoLocation() {
    const next = demoLocations[Math.floor(Math.random() * demoLocations.length)];
    const latitudeOffset = (Math.random() - 0.5) * 0.006;
    const longitudeOffset = (Math.random() - 0.5) * 0.006;
    setLatitude(Number((next.latitude + latitudeOffset).toFixed(6)));
    setLongitude(Number((next.longitude + longitudeOffset).toFixed(6)));
    setLocationName(next.name);
    setError("");
  }

  function applyPosition(position: GeolocationPosition) {
    setLatitude(Number(position.coords.latitude.toFixed(6)));
    setLongitude(Number(position.coords.longitude.toFixed(6)));
    setLocationName("Current GPS location");
    setIsLocating(false);
    setError("");
  }

  function handleLocationError(error: GeolocationPositionError) {
    const messages: Record<number, string> = {
      [error.PERMISSION_DENIED]: "Location permission was blocked. Use browser site settings to allow location, or continue with demo coordinates.",
      [error.POSITION_UNAVAILABLE]: "GPS position is unavailable right now. Continue with demo coordinates or enter latitude and longitude manually.",
      [error.TIMEOUT]: "GPS lookup timed out. Continue with demo coordinates or enter latitude and longitude manually."
    };
    setError(messages[error.code] || "Could not read GPS. Demo coordinates are still ready.");
    setIsLocating(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      () => {
        navigator.geolocation.getCurrentPosition(applyPosition, handleLocationError, {
          enableHighAccuracy: false,
          timeout: 12000,
          maximumAge: 60000
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) {
      setError("Add a photo before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.set("image", image);
    formData.set("description", description);
    formData.set("latitude", String(latitude));
    formData.set("longitude", String(longitude));
    if (user) {
      formData.set("userId", user.id);
      formData.set("userName", user.name);
    }

    const response = await fetch("/api/reports", { method: "POST", body: formData });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error || "Submission failed.");
      return;
    }
    setResult(data);
    notifyDataChanged();
  }

  return (
    <section className="pageStack">
      <div className="sectionHeader">
        <span className="badge">Citizen intake</span>
        <h1>Submit a civic issue</h1>
        <p>Upload a photo, attach GPS, and let AI classify the issue for clustering and priority scoring.</p>
      </div>

      <div className="surface compactNotice">
        <span>{user ? `Logged in as ${user.name} (${user.ward})` : "No citizen logged in. Submission will be recorded as a guest."}</span>
        <a className="button secondary" href="/login">Switch user</a>
      </div>

      <div className="split">
        <form className="surface form" onSubmit={submitReport}>
          <label>
            Issue photo
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </label>

          {previewUrl ? (
            <img className="preview" src={previewUrl} alt="Selected civic issue" />
          ) : (
            <div className="emptyPhoto"><Camera size={32} /><span>Photo preview</span></div>
          )}

          <label>
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="grid two">
            <label>
              Latitude
              <input type="number" step="0.000001" value={latitude} onChange={(event) => setLatitude(Number(event.target.value))} />
            </label>
            <label>
              Longitude
              <input type="number" step="0.000001" value={longitude} onChange={(event) => setLongitude(Number(event.target.value))} />
            </label>
          </div>
          <p className="muted">Selected location: {locationName}</p>

          <div className="actions">
            <button type="button" className="secondary" onClick={useCurrentLocation} disabled={isLocating}>
              {isLocating ? <Loader2 className="spin" size={18} /> : <Crosshair size={18} />}
              Use GPS
            </button>
            <button type="button" className="secondary" onClick={setDemoLocation}>
              <MapPin size={18} />
              Demo location
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
              Submit report
            </button>
          </div>

          {error ? <p className="alert">{error}</p> : null}
        </form>

        <aside className="surface resultPanel">
          <h2>AI and cluster result</h2>
          {result ? (
            <div className="resultGrid">
              <div>
                <span>Category</span>
                <strong>{formatCategory(result.classification.category)}</strong>
              </div>
              <div>
                <span>Severity</span>
                <strong>{formatSeverity(result.classification.severity)}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{Math.round(result.classification.confidence * 100)}%</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>{result.cluster.priority_score}/100</strong>
              </div>
              <div className="wide">
                <span>Cluster</span>
                <strong>{result.matchedExistingCluster ? "Matched existing issue" : "Created new issue"}</strong>
              </div>
              <div className="wide">
                <span>Department</span>
                <strong>{result.cluster.assigned_department}</strong>
              </div>
              <p className="wide muted">{result.classification.reason}</p>
              <a className="button" href="/dashboard">View dashboard</a>
            </div>
          ) : (
            <p className="muted">After submission, classification, duplicate matching, priority, and department routing appear here.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

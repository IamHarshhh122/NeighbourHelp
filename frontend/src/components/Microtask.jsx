import React, { useEffect, useRef, useState } from "react";
import {
  HiPlus, HiLocationMarker, HiClock, HiUser, HiTrash, HiMap, HiRefresh, HiX,
  HiPlay, HiArrowNarrowUp, HiArrowNarrowLeft, HiArrowNarrowRight, HiFlag,
  HiCamera, HiCheckCircle, HiExclamationCircle,
} from "react-icons/hi";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import colonyImg from "../assets/neighbourhood-colony.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "https://neighbourhelp-backend.onrender.com"
)
  .trim()
  .replace(/\/+$/, "");

const API = `${BACKEND_URL}/api`;
const NOMINATIM = "https://nominatim.openstreetmap.org";
const PHOTON = "https://photon.komoot.io";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

const HOUSE_NUM_PATTERNS = [
  /^\d+[\/\-]\d+[a-z]?$/i,
  /^[a-z]?[\/\-]?\d+[a-z]?$/i,
  /^\d+$/i,
  /^block\s*[a-z0-9]+$/i,
  /^plot\s*no\.?\s*\d+$/i,
  /^house\s*no\.?\s*\d+$/i,
  /^flat\s*no\.?\s*\d+$/i,
  /^sector\s*\d+$/i,
];

const NOISE_WORDS = /^(u\.?p\.?|uttar pradesh|india|near|opposite|opp|beside|behind|in front of)$/i;

const isHouseNumber = (part) =>
  HOUSE_NUM_PATTERNS.some((re) => re.test(part.trim()));

const isNoise = (part) => NOISE_WORDS.test(part.trim());

const stripLeadingHouseNum = (str) =>
  str.replace(/^[a-z]?\d+[a-z]?[\/\-]?\d*[a-z]?\s+/i, "").trim();

function buildQueries(address) {
  const clean = address.trim().replace(/\s+/g, " ");
  const parts = clean.split(",").map((p) => p.trim()).filter(Boolean);

  const pincode = clean.match(/\b\d{6}\b/)?.[0] || null;
  const meaningful = parts.filter((p) => !isHouseNumber(p) && !isNoise(p));
  const cleanedMeaningful = meaningful.map(stripLeadingHouseNum).filter(Boolean);

  const queries = [];

  if (clean) queries.push(clean);
  if (meaningful.length) queries.push(meaningful.join(", "));
  if (cleanedMeaningful.length) queries.push(cleanedMeaningful.join(", "));

  for (let n = 4; n >= 1; n--) {
    if (cleanedMeaningful.length >= n) {
      queries.push(cleanedMeaningful.slice(-n).join(", "));
    }
  }

  if (cleanedMeaningful.length > 1) {
    queries.push(cleanedMeaningful.slice(1).join(", "));
  }

  if (pincode) {
    queries.push(`${pincode} India`);
    queries.push(pincode);
  }

  return [...new Set(queries)].filter((q) => q && q.length >= 3);
}

async function nominatimSearch(query, near) {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "5",
      countrycodes: "in",
      q: query,
    });

    if (near) {
      const d = 0.5;
      params.set(
        "viewbox",
        `${near.lng - d},${near.lat + d},${near.lng + d},${near.lat - d}`
      );
    }

    const res = await fetch(`${NOMINATIM}/search?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 429) await sleep(2000);
      return [];
    }

    const data = await res.json();
    return (data || []).map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      label: item.display_name,
    }));
  } catch (err) {
    console.warn("Nominatim failed:", err);
    return [];
  }
}

async function photonSearch(query, near) {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: "5",
      lang: "en",
    });

    if (near) {
      params.set("lat", String(near.lat));
      params.set("lon", String(near.lng));
    }

    const res = await fetch(`${PHOTON}/api/?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.features || [])
      .filter((f) => {
        const country = f.properties?.countrycode;
        return !country || country === "IN";
      })
      .map((f) => {
        const p = f.properties || {};
        const labelParts = [
          p.name,
          p.street,
          p.district,
          p.city,
          p.state,
          p.postcode,
        ].filter(Boolean);
        return {
          lat: Number(f.geometry.coordinates[1]),
          lng: Number(f.geometry.coordinates[0]),
          label: labelParts.join(", ") || p.name || "Unknown",
        };
      });
  } catch (err) {
    console.warn("Photon failed:", err);
    return [];
  }
}

async function searchPlaces(address, near) {
  const queries = buildQueries(address);
  if (!queries.length) return [];

  const seen = new Set();
  const collected = [];
  const addResult = (r) => {
    const key = `${r.lat.toFixed(4)},${r.lng.toFixed(4)}`;
    if (seen.has(key)) return;
    seen.add(key);
    collected.push(r);
  };

  const pincode = address.match(/\b\d{6}\b/)?.[0] || null;
  const tokens = buildQueries(address)
    .flatMap((q) => q.split(/[,\s]+/))
    .map(norm)
    .filter((t) => t.length > 2);

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];

    const nomResults = await nominatimSearch(q, near);
    nomResults.forEach(addResult);
    if (collected.length >= 4) break;

    const phResults = await photonSearch(q, near);
    phResults.forEach(addResult);
    if (collected.length >= 4) break;

    if (i < queries.length - 1) await sleep(1100);
  }

  const score = (r) => {
    let s = 0;
    const label = norm(r.label);
    for (const t of tokens) if (label.includes(t)) s += 2;
    if (pincode && r.label.includes(pincode)) s += 6;
    if (near) {
      const dLat = Math.abs(r.lat - near.lat);
      const dLng = Math.abs(r.lng - near.lng);
      const d = dLat + dLng;
      if (d < 0.05) s += 5;
      else if (d < 0.2) s += 3;
      else if (d < 0.5) s += 1;
    }
    return s;
  };

  collected.sort((a, b) => score(b) - score(a));
  return collected.slice(0, 6);
}

async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lng),
      zoom: "18",
      addressdetails: "1",
    });
    const res = await fetch(`${NOMINATIM}/reverse?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.display_name) return data.display_name;
    }
  } catch (err) {
    console.warn("Nominatim reverse failed:", err);
  }

  try {
    const res = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}&lang=en`);
    if (res.ok) {
      const data = await res.json();
      const p = data.features?.[0]?.properties;
      if (p) {
        return [p.name, p.street, p.district, p.city, p.state, p.postcode]
          .filter(Boolean)
          .join(", ");
      }
    }
  } catch (err) {
    console.warn("Photon reverse failed:", err);
  }

  return null;
}

const CATEGORY_BONUS = {
  "General Help": 0,
  "Parcel Receiving": 5,
  "Quick Fix": 15,
  "Bank Errands": 10,
  "Grocery Pickup": 8,
  Tutoring: 25,
};

function calculateReward(distanceKm, category) {
  const base = 10;
  let distanceBonus = 5;
  if (distanceKm != null) {
    if (distanceKm <= 0.5) distanceBonus = 5;
    else if (distanceKm <= 1) distanceBonus = 10;
    else if (distanceKm <= 2) distanceBonus = 20;
    else if (distanceKm <= 5) distanceBonus = 35;
    else distanceBonus = 50;
  }
  const categoryBonus = CATEGORY_BONUS[category] ?? 0;
  return base + distanceBonus + categoryBonus;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(a.lat * (Math.PI / 180)) *
      Math.cos(b.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function getManeuverIcon(step) {
  const type = (step?.type || "").toLowerCase();
  const mod = (step?.modifier || "").toLowerCase();

  if (type.includes("arrive")) return { Icon: HiFlag, label: "Arrive at destination" };
  if (type.includes("depart")) return { Icon: HiArrowNarrowUp, label: "Start" };
  if (mod.includes("left")) return { Icon: HiArrowNarrowLeft, label: "Turn left" };
  if (mod.includes("right")) return { Icon: HiArrowNarrowRight, label: "Turn right" };
  if (mod.includes("straight")) return { Icon: HiArrowNarrowUp, label: "Go straight" };
  return { Icon: HiArrowNarrowUp, label: "Continue" };
}

function RoutingMachine({ userLoc, taskLoc, onRouteFound, onRouteData, onRouteError, retryKey }) {
  const map = useMap();
  const routingControlRef = React.useRef(null);

  useEffect(() => {
    if (!map || !userLoc || !taskLoc) return;
    let isMounted = true;
    let timeoutId;

    if (onRouteError) onRouteError(false);

    try {
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(userLoc.lat, userLoc.lng), L.latLng(taskLoc.lat, taskLoc.lng)],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,
        addWaypoints: false,
        lineOptions: { styles: [{ color: "#10b981", weight: 5, opacity: 0.9 }] },
        createMarker: function (i, waypoint) {
          const isStart = i === 0;
          const icon = L.divIcon({
            className: "",
            html: `<div style="
              width: 36px; height: 36px;
              background: ${isStart ? "#10b981" : "#ef4444"};
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 14px ${isStart ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)"};
              display: flex; align-items: center; justify-content: center;
              color: #ffffff; font-weight: 800; font-size: 14px;
              font-family: system-ui, sans-serif;
            ">${isStart ? "A" : "B"}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
          return L.marker(waypoint.latLng, { icon });
        },
      });

      timeoutId = setTimeout(() => {
        if (isMounted) {
          if (onRouteFound) onRouteFound(null);
          if (onRouteData) onRouteData(null);
          if (onRouteError) onRouteError(true);
        }
      }, 12000);

      routingControl.on("routesfound", (e) => {
        clearTimeout(timeoutId);
        if (!isMounted || !map) return;
        const route = e.routes?.[0];
        if (!route) return;
        if (onRouteFound) {
          onRouteFound({
            distanceKm: (route.summary.totalDistance / 1000).toFixed(1),
            timeMin: Math.round(route.summary.totalTime / 60),
          });
        }
        if (onRouteData) {
          const coordinates = (route.coordinates || []).map((c) => ({ lat: c.lat, lng: c.lng }));
          const instructions = (route.instructions || []).map((ins) => ({
            text: ins.text,
            type: ins.type,
            modifier: ins.modifier,
            index: ins.index,
          }));
          onRouteData({ coordinates, instructions });
        }
        if (onRouteError) onRouteError(false);
      });

      routingControl.on("routingerror", () => {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        if (onRouteFound) onRouteFound(null);
        if (onRouteData) onRouteData(null);
        if (onRouteError) onRouteError(true);
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (err) {
      console.warn("Routing initialization skipped:", err);
      if (onRouteError) onRouteError(true);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (routingControlRef.current && map) {
        try {
          if (map._loaded && typeof map.removeControl === "function") {
            map.removeControl(routingControlRef.current);
          }
        } catch (e) {}
        routingControlRef.current = null;
      }
    };
  }, [map, userLoc?.lat, userLoc?.lng, taskLoc?.lat, taskLoc?.lng, retryKey]);

  return null;
}

function FollowUser({ position, active }) {
  const map = useMap();
  useEffect(() => {
    if (active && position) {
      map.panTo([position.lat, position.lng], { animate: true });
    }
  }, [map, position, active]);
  return null;
}

function PinClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function PinRecenter({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView([focus.lat, focus.lng], 17);
  }, [map, focus?.k]);
  return null;
}

function PinPicker({ focus, fallback, position, onPick }) {
  const markerRef = useRef(null);
  const initial = focus || position || fallback || { lat: 28.6725, lng: 77.4355 };

  return (
    <MapContainer
      center={[initial.lat, initial.lng]}
      zoom={focus || position || fallback ? 16 : 5}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PinClickHandler onPick={onPick} />
      <PinRecenter focus={focus} />
      {position && (
        <Marker
          draggable
          position={[position.lat, position.lng]}
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const m = markerRef.current;
              if (m) {
                const ll = m.getLatLng();
                onPick({ lat: ll.lat, lng: ll.lng });
              }
            },
          }}
        />
      )}
    </MapContainer>
  );
}

function BackgroundLayer() {
  const ballRef = useRef(null);

  useEffect(() => {
    const el = ballRef.current;
    if (!el) return;

    const size = window.innerWidth < 640 ? 320 : 380;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    let x = Math.random() * Math.max(window.innerWidth - size, 1);
    let y = Math.random() * Math.max(window.innerHeight - size, 1);
    let vx = 2.2;
    let vy = 1.7;
    let rot = 0;
    let last = performance.now();
    let raf;

    const tick = (now) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;

      const maxX = window.innerWidth - size;
      const maxY = window.innerHeight - size;

      x += vx * dt;
      y += vy * dt;

      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
      } else if (x >= maxX) {
        x = Math.max(maxX, 0);
        vx = -Math.abs(vx);
      }
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
      } else if (y >= maxY) {
        y = Math.max(maxY, 0);
        vy = -Math.abs(vy);
      }

      rot += (vx > 0 ? 1 : -1) * 0.9 * dt;

      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60%] h-[45%] bg-emerald-600/[0.07] rounded-full blur-[550px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-emerald-800/[0.07] rounded-full blur-[550px]" />

      <div
        ref={ballRef}
        className="absolute top-0 left-0 rounded-full overflow-hidden border border-emerald-400/30 bg-[#0d1218]"
        style={{
          opacity: 0.6,
          willChange: "transform",
          boxShadow:
            "0 0 50px rgba(34,197,94,0.22), inset 0 0 30px rgba(34,197,94,0.12)",
        }}
      >
        <img
          src={colonyImg}
          alt=""
          draggable={false}
          className="w-full h-full object-cover"
          style={{ filter: "saturate(0.9) brightness(1.05)" }}
        />
      </div>
    </div>
  );
}

function CompletionModal({ task, onClose, onSubmit, submitting }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!photo) {
      toast.error("Please upload a photo as proof");
      return;
    }
    onSubmit({ photo, photoPreview, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1218] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-xl font-bold text-white">Submit Work Proof</h2>
            <p className="text-xs text-slate-500 mt-1">
              A photo is required for verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-200 transition"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Photo Proof <span className="text-emerald-400">*</span>
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]">
                <img src={photoPreview} alt="proof" className="w-full h-52 object-cover" />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition"
                >
                  <HiX className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 flex flex-col items-center justify-center gap-2 transition"
              >
                <HiCamera className="text-3xl text-slate-500" />
                <span className="text-xs font-medium text-slate-400">
                  Tap to upload photo
                </span>
                <span className="text-[10px] text-slate-600">JPG, PNG · Max 5MB</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details to share with the poster..."
              rows={3}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition"
            />
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-500/[0.06] border border-blue-500/20">
            <HiExclamationCircle className="text-blue-400 text-sm shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200/90 leading-relaxed">
              The poster will have 24 hours to confirm. If they don't respond,
              it will be auto-confirmed and credits will be added to your account.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-sm font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !photo}
              className="flex-[1.4] h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-[#04140a] transition shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : `Submit · +${task.reward || 0} credits`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisputeModal({ task, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState("work_not_done");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    { key: "work_not_done", label: "Work was not done" },
    { key: "incomplete", label: "Work was incomplete" },
    { key: "wrong_item", label: "Wrong item or result" },
    { key: "damaged", label: "Something was damaged" },
    { key: "other", label: "Other reason" },
  ];

  const handleSubmit = () => {
    if (reason === "other" && !customReason.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    onSubmit({ reason, customReason });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1218] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-xl font-bold text-white">Raise a Dispute</h2>
            <p className="text-xs text-slate-500 mt-1">
              Tell us why the work wasn't completed properly
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-200 transition"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {reasons.map((r) => (
              <label
                key={r.key}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  reason === r.key
                    ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <input
                  type="radio"
                  name="dispute-reason"
                  value={r.key}
                  checked={reason === r.key}
                  onChange={() => setReason(r.key)}
                  className="w-4 h-4 accent-emerald-500 shrink-0"
                />
                <span className="text-sm text-slate-200">{r.label}</span>
              </label>
            ))}
          </div>

          {reason === "other" && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none focus:border-emerald-500/60 transition"
            />
          )}

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
            <HiExclamationCircle className="text-amber-400 text-sm shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              False disputes affect your trust score. Only raise if there's a genuine issue.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-sm font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[1.4] h-11 rounded-xl bg-red-500/90 hover:bg-red-500 text-sm font-bold text-white transition disabled:opacity-40"
            >
              {submitting ? "Submitting..." : "Raise Dispute"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Microtask() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  const [selectedTaskMap, setSelectedTaskMap] = useState(null);
  const [routeSource, setRouteSource] = useState("home");
  const [routeSummary, setRouteSummary] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeError, setRouteError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const [navigating, setNavigating] = useState(false);
  const [liveNavPos, setLiveNavPos] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const watchIdRef = React.useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General Help");
  const [address, setAddress] = useState("");
  const [taskLocation, setTaskLocation] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const [locating, setLocating] = useState(false);

  const [completionTask, setCompletionTask] = useState(null);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [disputeTask, setDisputeTask] = useState(null);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("Users") || "{}");
    } catch {
      return {};
    }
  };

  const user = getUser();
  const userId = user._id || user.id;

  const helperHomeLoc =
    user.homeLat != null && user.homeLng != null
      ? { lat: Number(user.homeLat), lng: Number(user.homeLng) }
      : null;

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS is not supported by your browser");
      setLocationLoading(false);
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);
        fetchTasks(latitude, longitude);
      },
      (error) => {
        console.error("GPS Error:", error);
        setLocationLoading(false);
        toast.error("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const fetchTasks = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/tasks/nearby?lat=${lat}&lng=${lng}&radiusInKm=50`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load tasks");
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Fetch Tasks:", error);
      toast.error("Failed to load nearby tasks");
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = () => {
    if (!navigator.geolocation) return toast.error("GPS is not supported");
    if (!routeData || !routeData.instructions?.length) {
      return toast.error("Please wait for the route to load");
    }
    setCurrentStepIdx(0);
    setNavigating(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLiveNavPos({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.error("Navigation GPS Error:", error);
        toast.error("Live tracking error");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
    toast.success("Navigation started");
  };

  const stopNavigation = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavigating(false);
    setLiveNavPos(null);
    setCurrentStepIdx(0);
  };

  useEffect(() => {
    if (!navigating || !liveNavPos || !routeData) return;
    const steps = routeData.instructions;
    if (!steps || currentStepIdx >= steps.length) return;
    const step = steps[currentStepIdx];
    const stepCoord = routeData.coordinates[step.index];
    if (!stepCoord) return;
    const dist = distanceMeters(liveNavPos, stepCoord);
    if (dist < 25 && currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((idx) => idx + 1);
    }
    if (dist < 15 && currentStepIdx === steps.length - 1) {
      toast.success("You have arrived");
      stopNavigation();
    }
  }, [liveNavPos, navigating, routeData, currentStepIdx]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    getLocation();
  }, []);

  const handleAddressSearch = async (addr) => {
    if (!addr.trim()) {
      toast.error("Type a colony, landmark or address first");
      return null;
    }

    try {
      setGeocoding(true);
      const found = await searchPlaces(addr, location);
      setSuggestions(found);

      if (found.length > 0) {
        const first = { lat: found[0].lat, lng: found[0].lng };
        setTaskLocation(first);
        setMapFocus({ ...first, k: Date.now() });
        setShowPicker(true);
        toast.success(
          found.length > 1
            ? `${found.length} matches found. Pick the right one below.`
            : "Location found! Drag the pin to your exact house/gate."
        );
        return first;
      }

      const fallback = location || { lat: 28.66585, lng: 77.35115 };
      setTaskLocation(fallback);
      setMapFocus({ ...fallback, k: Date.now() });
      setShowPicker(true);
      toast("Couldn't auto-find this address. Drop the pin on the map.");
      return fallback;
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.error("Search failed. Drop a pin on the map instead.");
      setShowPicker(true);
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  const fillFromGps = () => {
    if (!navigator.geolocation) {
      return toast.error("GPS is not supported by your browser");
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setTaskLocation(p);
        setMapFocus({ ...p, k: Date.now() });
        setSuggestions([]);
        setShowPicker(true);
        if (!address.trim()) {
          const name = await reverseGeocode(p.lat, p.lng);
          if (name) setAddress((cur) => (cur.trim() ? cur : name));
        }
        setLocating(false);
        toast.success("Using your current location. Drag the pin to adjust.");
      },
      (err) => {
        console.error("GPS Error:", err);
        setLocating(false);
        toast.error("Could not get your location. Allow GPS or pick on the map.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePinPick = async (p) => {
    setTaskLocation(p);
    if (!address.trim()) {
      const name = await reverseGeocode(p.lat, p.lng);
      if (name) setAddress((cur) => (cur.trim() ? cur : name));
    }
  };

  const togglePicker = () => {
    if (!showPicker && !mapFocus) {
      if (location) {
        setMapFocus({ ...location, k: Date.now() });
      } else {
        setMapFocus({ lat: 28.6669, lng: 77.3547, k: Date.now() });
      }
    }
    setShowPicker((v) => !v);
  };

  const handlePostTask = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("Please login first");
    if (!title.trim() || !description.trim() || !address.trim()) {
      return toast.error("All fields are required");
    }
    const finalLoc = taskLocation;
    if (!finalLoc) {
      await handleAddressSearch(address.trim());
      return;
    }

    const distanceForReward = location
      ? calculateDistance(location.lat, location.lng, finalLoc.lat, finalLoc.lng)
      : null;
    const reward = calculateReward(distanceForReward, category);

    try {
      const response = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          location: {
            address: address.trim(),
            lat: finalLoc.lat,
            lng: finalLoc.lng,
          },
          poster: userId,
          reward,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");

      setTasks((prev) => [data.task, ...prev]);
      setTitle("");
      setDescription("");
      setAddress("");
      setTaskLocation(null);
      setSuggestions([]);
      setShowPicker(false);
      setMapFocus(null);
      setCategory("General Help");
      setShowModal(false);
      setActiveTab("posted");
      toast.success("Task published");
    } catch (error) {
      console.error("Post Task:", error);
      toast.error(error.message || "Server error");
    }
  };

  const handleAcceptTask = async (task) => {
    if (!userId) return toast.error("Please login first");
    if (String(task.poster?._id) === String(userId)) {
      return toast.error("You cannot accept your own task");
    }
    try {
      const response = await fetch(`${API}/tasks/accept/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId: userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data.task : t)));
      toast.success("Task accepted");
    } catch (error) {
      console.error("Accept Task:", error);
      toast.error(error.message || "Server error");
    }
  };

  const handleSubmitCompletion = async ({ photo, photoPreview, notes }) => {
    if (!completionTask) return;
    try {
      setSubmittingCompletion(true);
      const gps = liveNavPos || location || null;
      const gpsString = gps ? `${gps.lat.toFixed(6)},${gps.lng.toFixed(6)}` : null;

      const response = await fetch(`${API}/tasks/complete/${completionTask._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helperId: userId,
          photo: photoPreview,
          notes: notes.trim(),
          gps: gpsString,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");

      setTasks((prev) => prev.map((t) => (t._id === completionTask._id ? data.task : t)));
      setCompletionTask(null);

      try {
        const u = JSON.parse(localStorage.getItem("Users") || "{}");
        u.points = (u.points ?? 20) + (completionTask.reward || 0);
        localStorage.setItem("Users", JSON.stringify(u));
        window.dispatchEvent(new Event("profileUpdated"));
      } catch {}

      toast.success(`+${completionTask.reward || 0} credits added`);
    } catch (error) {
      console.error("Complete Task:", error);
      toast.error(error.message || "Server error");
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const handleSubmitDispute = async ({ reason, customReason }) => {
    if (!disputeTask) return;
    try {
      setSubmittingDispute(true);
      const response = await fetch(`${API}/tasks/dispute/${disputeTask._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posterId: userId,
          reason,
          customReason: customReason.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");
      setTasks((prev) => prev.map((t) => (t._id === disputeTask._id ? data.task : t)));
      setDisputeTask(null);
      toast.success("Dispute raised. Our team will review within 48 hours.");
    } catch (error) {
      console.error("Dispute:", error);
      toast.error(error.message || "Server error");
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleConfirmTask = async (task) => {
    if (!userId) return toast.error("Please login first");
    try {
      const response = await fetch(`${API}/tasks/confirm/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId: userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data.task : t)));
      toast.success("Task confirmed");
    } catch (error) {
      console.error("Confirm Task:", error);
      toast.error(error.message || "Server error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const response = await fetch(`${API}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed");
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error("Delete Task:", error);
      toast.error(error.message || "Server error");
    }
  };

  const openMapModal = (task) => {
    const lat = Number(task.location?.lat);
    const lng = Number(task.location?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return toast.error("Task GPS unavailable");
    }
    setRouteSource(helperHomeLoc ? "home" : "current");
    setRouteSummary(null);
    setRouteData(null);
    setRouteError(false);
    setRetryKey(0);
    stopNavigation();
    setSelectedTaskMap(task);
  };

  const myPostedTasks = tasks.filter((task) => String(task.poster?._id) === String(userId));
  const acceptedTasks = tasks.filter((task) => String(task.helper?._id) === String(userId));
  const availableTasks = tasks.filter(
    (task) => task.status === "Open" && String(task.poster?._id) !== String(userId)
  );

  const tabs = [
    {
      key: "available",
      label: "Nearby",
      count: availableTasks.length,
      list: availableTasks,
      empty: "No open tasks nearby right now.",
    },
    {
      key: "posted",
      label: "My posts",
      count: myPostedTasks.length,
      list: myPostedTasks,
      empty: "You haven't posted any tasks yet.",
    },
    {
      key: "accepted",
      label: "Helping",
      count: acceptedTasks.length,
      list: acceptedTasks,
      empty: "You haven't accepted any tasks yet.",
    },
  ];
  const current = tabs.find((t) => t.key === activeTab);
  const routeOriginPoint = routeSource === "home" ? helperHomeLoc : location;

  const inputCls =
    "w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition";

  return (
    <div className="min-h-screen bg-[#090d12] text-slate-100 flex flex-col relative">
      <BackgroundLayer />

      <main className="w-full max-w-4xl mx-auto px-5 sm:px-6 pt-12 pb-20 relative z-10 flex-1">
        <header className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400 mb-4">
            Help around you
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Tasks near you,
            <br />
            <span className="text-emerald-400">neighbours need.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-5 max-w-md mx-auto leading-relaxed">
            Someone nearby needs a quick hand. Small task, big difference.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setTaskLocation(null);
                setSuggestions([]);
                setShowPicker(false);
                setMapFocus(null);
                setShowModal(true);
              }}
              className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04140a] text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
            >
              <HiPlus className="text-base" />
              Post a task
            </button>
            <button
              onClick={getLocation}
              className="h-11 px-5 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 text-sm font-medium flex items-center gap-2 transition"
            >
              <HiRefresh className={`text-base ${locationLoading ? "animate-spin" : ""}`} />
              {locationLoading ? "Locating" : "Refresh"}
            </button>
          </div>

          {location && (
            <p className="mt-5 inline-flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Location on · {location.lat.toFixed(3)}, {location.lng.toFixed(3)}
            </p>
          )}
        </header>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 sm:px-5 h-10 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                  activeTab === t.key
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {t.label}
                <span
                  className={`text-[11px] px-1.5 rounded-md ${
                    activeTab === t.key ? "bg-emerald-500/20" : "bg-white/[0.05]"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-9 h-9 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Finding nearby tasks...</p>
          </div>
        ) : current.list.length === 0 ? (
          <EmptyState text={current.empty} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {current.list.map((task) => {
              const distance = calculateDistance(
                location?.lat,
                location?.lng,
                task.location?.lat,
                task.location?.lng
              );
              return (
                <TaskCard
                  key={task._id}
                  task={task}
                  distance={activeTab === "posted" ? null : distance}
                  own={activeTab === "posted"}
                  accepted={activeTab === "accepted"}
                  onAccept={() => handleAcceptTask(task)}
                  onDelete={() => handleDeleteTask(task._id)}
                  onMap={() => openMapModal(task)}
                  onMarkDone={() => setCompletionTask(task)}
                  onDispute={() => setDisputeTask(task)}
                  onConfirm={() => handleConfirmTask(task)}
                />
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1218] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 className="text-xl font-bold text-white">Post a task</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ask your neighbour for help — completely free
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-200 transition"
              >
                <HiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handlePostTask} className="p-6 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the task? (e.g., Pick up a parcel)"
                className={inputCls}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option className="bg-slate-900">General Help</option>
                <option className="bg-slate-900">Parcel Receiving</option>
                <option className="bg-slate-900">Quick Fix</option>
                <option className="bg-slate-900">Bank Errands</option>
                <option className="bg-slate-900">Grocery Pickup</option>
                <option className="bg-slate-900">Tutoring</option>
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                rows={3}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-slate-100 placeholder:text-slate-500 outline-none resize-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition"
              />

              <div>
                <div className="flex gap-2">
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 20/1686, Block B, Jhandapur, Sahibabad..."
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddressSearch(address)}
                    disabled={geocoding}
                    className="px-4 h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-sm font-medium text-slate-200 transition shrink-0 disabled:opacity-50"
                  >
                    {geocoding ? "..." : "Find"}
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={fillFromGps}
                    disabled={locating}
                    className="flex-1 h-9 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.14] text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <HiLocationMarker className="text-sm" />
                    {locating ? "Locating..." : "Use my location"}
                  </button>
                  <button
                    type="button"
                    onClick={togglePicker}
                    className="flex-1 h-9 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.07] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <HiMap className="text-sm" />
                    {showPicker ? "Hide map" : "Pick on map"}
                  </button>
                </div>

                {suggestions.length > 1 && (
                  <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.05]">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.lat}-${s.lng}-${i}`}
                        type="button"
                        onClick={() => {
                          const p = { lat: s.lat, lng: s.lng };
                          setTaskLocation(p);
                          setMapFocus({ ...p, k: Date.now() });
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-white/[0.05] transition"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                {showPicker && (
                  <div className="mt-3">
                    <div className="w-full h-56 rounded-2xl overflow-hidden border border-white/[0.08] relative z-0">
                      <PinPicker
                        focus={mapFocus}
                        fallback={location}
                        position={taskLocation}
                        onPick={handlePinPick}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Tap the map or drag the pin to your exact house or gate.
                    </p>
                  </div>
                )}

                {taskLocation && !geocoding && (
                  <p className="text-xs text-emerald-400 mt-2">Pin set. Location mapped.</p>
                )}
                {!taskLocation && !geocoding && !showPicker && (
                  <p className="text-[11px] text-slate-500 mt-2">
                    Exact address not needed. Search a colony, use your location, or drop a pin.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                <HiExclamationCircle className="text-emerald-400 text-sm shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Posting is free. Your helper will earn credits based on distance and task type
                  once the work is complete.
                </p>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-sm font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[1.4] h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-bold text-[#04140a] transition shadow-lg shadow-emerald-500/20"
                >
                  Publish task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {completionTask && (
        <CompletionModal
          task={completionTask}
          onClose={() => setCompletionTask(null)}
          onSubmit={handleSubmitCompletion}
          submitting={submittingCompletion}
        />
      )}

      {disputeTask && (
        <DisputeModal
          task={disputeTask}
          onClose={() => setDisputeTask(null)}
          onSubmit={handleSubmitDispute}
          submitting={submittingDispute}
        />
      )}

{selectedTaskMap && (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-[#0d1218] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
      <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.06]">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white truncate">
            {selectedTaskMap.title}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {selectedTaskMap.category} · +{selectedTaskMap.reward || 0} credits
          </p>
        </div>
        <button
          onClick={() => {
            stopNavigation();
            setSelectedTaskMap(null);
          }}
          className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-200 transition shrink-0"
        >
          <HiX className="text-lg" />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {[
            { k: "home", l: "From home" },
            { k: "current", l: "From current location" },
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => {
                setRouteSource(o.k);
                setRouteSummary(null);
                setRouteData(null);
                setRouteError(false);
                stopNavigation();
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                routeSource === o.k
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-500 hover:text-slate-200"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>

        <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/[0.08] relative z-0">
          <MapContainer
            center={[
              Number(selectedTaskMap.location?.lat),
              Number(selectedTaskMap.location?.lng),
            ]}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(() => {
              const routeOrigin = routeSource === "home" ? helperHomeLoc : location;
              if (!routeOrigin) return null;
              return (
                <RoutingMachine
                  userLoc={routeOrigin}
                  taskLoc={{
                    lat: Number(selectedTaskMap.location?.lat),
                    lng: Number(selectedTaskMap.location?.lng),
                  }}
                  onRouteFound={setRouteSummary}
                  onRouteData={setRouteData}
                  onRouteError={setRouteError}
                  retryKey={retryKey}
                />
              );
            })()}
            {navigating && liveNavPos && (
              <Marker position={[liveNavPos.lat, liveNavPos.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            <FollowUser position={liveNavPos} active={navigating} />
          </MapContainer>
        </div>

        {navigating && routeData?.instructions?.[currentStepIdx] ? (
          <div className="flex items-center gap-3 bg-emerald-500 rounded-2xl p-3.5 text-[#04140a]">
            {(() => {
              const step = routeData.instructions[currentStepIdx];
              const stepCoord = routeData.coordinates[step.index];
              const { Icon, label } = getManeuverIcon(step);
              const metersToTurn = liveNavPos
                ? Math.round(distanceMeters(liveNavPos, stepCoord))
                : null;
              return (
                <>
                  <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                    <Icon className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{label}</p>
                    <p className="text-[11px] opacity-80 truncate mt-0.5">
                      {metersToTurn != null ? `In ${metersToTurn} m · ` : ""}
                      {step.text || "Continue"}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        ) : routeSummary ? (
          <div className="flex items-center justify-center gap-3 text-sm bg-white/[0.03] border border-white/[0.07] rounded-xl py-3">
            <span className="text-white font-semibold">{routeSummary.distanceKm} km</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">~{routeSummary.timeMin} min</span>
          </div>
        ) : routeError ? (
          <div className="flex items-center justify-between gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-3.5 py-2.5">
            <p className="text-[11px] text-red-300">Route service busy hai.</p>
            <button
              type="button"
              onClick={() => {
                setRouteError(false);
                setRetryKey((k) => k + 1);
              }}
              className="shrink-0 h-7 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-semibold transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5 text-xs text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-xl py-3">
            <div className="w-3.5 h-3.5 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
            Finding route...
          </div>
        )}

        {!navigating ? (
          <button
            type="button"
            onClick={startNavigation}
            disabled={!routeData}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04140a] text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiPlay className="text-base" />
            Start navigation
          </button>
        ) : (
          <button
            type="button"
            onClick={stopNavigation}
            className="w-full h-11 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition"
          >
            <HiX className="text-base" />
            Stop navigation
          </button>
        )}

        {routeSource === "home" && !helperHomeLoc && (
          <p className="text-[10px] text-amber-400/90 text-center leading-relaxed">
            Home address set nahi hai. Profile mein set karo ya "From current location" use karo.
          </p>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function TaskCard({ task, own, accepted, distance, onAccept, onDelete, onMap, onMarkDone, onDispute, onConfirm }) {
  const status = task.status;
  const reward = task.reward || 0;
  const isOpen = status === "Open";
  const isHelping = status === "Helping" || status === "In Progress";
  const isAwaiting = status === "Awaiting Approval";
  const isCompleted = status === "Completed";
  const isDisputed = status === "Disputed";

  const statusColor = isOpen
    ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
    : isHelping
    ? "text-amber-300 bg-amber-500/10 border-amber-500/25"
    : isAwaiting
    ? "text-blue-300 bg-blue-500/10 border-blue-500/25"
    : isDisputed
    ? "text-red-300 bg-red-500/10 border-red-500/25"
    : "text-slate-300 bg-white/[0.05] border-white/[0.1]";

  const statusLabel = isAwaiting ? "Awaiting Approval" : status;

  return (
    <div className="rounded-3xl border border-emerald-500/[0.12] bg-gradient-to-br from-emerald-900/[0.18] via-[#0d1218] to-[#0d1218] hover:border-emerald-500/30 p-6 transition-colors duration-200 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
          {task.category}
        </span>
        <div className="flex items-center gap-2">
          {reward > 0 && !isCompleted && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
              +{reward} credits
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white leading-snug mb-2">{task.title}</h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-5">{task.description}</p>

      <div className="space-y-2 mb-5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HiLocationMarker className="text-sm shrink-0 text-emerald-500/70" />
          <span className="truncate">{task.location?.address || "Location unavailable"}</span>
          {distance && (
            <span className="ml-auto shrink-0 text-slate-300 font-semibold">{distance} km</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <HiUser className="text-sm shrink-0 text-emerald-500/70" />
          <span className="truncate">
            {task.poster?.fullname || task.poster?.name || "Neighbour"}
          </span>
        </div>
      </div>

      {accepted && isHelping && (
        <div className="mb-4 text-xs font-medium text-emerald-300 bg-emerald-500/[0.08] border border-emerald-500/20 px-3 py-2 rounded-xl">
          You are helping with this task
        </div>
      )}
      {accepted && isAwaiting && (
        <div className="mb-4 text-xs font-medium text-blue-300 bg-blue-500/[0.08] border border-blue-500/20 px-3 py-2 rounded-xl">
          Waiting for the poster to confirm. Auto-confirms in 24 hours.
        </div>
      )}
      {accepted && isCompleted && (
        <div className="mb-4 text-xs font-medium text-emerald-300 bg-emerald-500/[0.08] border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
          <HiCheckCircle className="text-sm" />
          Completed — {reward} credits added to your account
        </div>
      )}
      {own && isAwaiting && (
        <div className="mb-4 text-xs font-medium text-blue-300 bg-blue-500/[0.08] border border-blue-500/20 px-3 py-2 rounded-xl">
          Helper submitted proof. Confirm the work or raise a dispute.
        </div>
      )}
      {own && isCompleted && (
        <div className="mb-4 text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.1] px-3 py-2 rounded-xl flex items-center gap-1.5">
          <HiCheckCircle className="text-sm" />
          Task completed — {reward} credits awarded to the helper
        </div>
      )}
      {isDisputed && (
        <div className="mb-4 text-xs font-medium text-red-300 bg-red-500/[0.08] border border-red-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
          <HiExclamationCircle className="text-sm" />
          Under dispute — our team will review this within 48 hours
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onMap}
          className="flex-1 h-10 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <HiMap className="text-sm" />
          Route
        </button>

        {own && isOpen && (
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 text-slate-500 hover:text-red-400 flex items-center justify-center transition shrink-0"
            title="Delete"
          >
            <HiTrash className="text-sm" />
          </button>
        )}
        {own && isHelping && (
          <span className="flex-1 h-10 rounded-xl bg-white/[0.03] text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/[0.08]">
            <HiClock className="text-sm" />
            Helper is working
          </span>
        )}
        {own && isAwaiting && (
          <>
            <button
              onClick={onDispute}
              className="h-10 px-3 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold transition shrink-0"
            >
              Dispute
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04140a] text-xs font-bold transition"
            >
              Confirm
            </button>
          </>
        )}
        {own && isCompleted && (
          <span className="flex-1 h-10 rounded-xl bg-emerald-500/[0.08] text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/20">
            <HiCheckCircle className="text-sm" />
            Completed
          </span>
        )}
        {own && isDisputed && (
          <span className="flex-1 h-10 rounded-xl bg-red-500/[0.08] text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-500/20">
            Under review
          </span>
        )}

        {!own && !accepted && isOpen && (
          <button
            onClick={onAccept}
            className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#04140a] text-xs font-bold transition"
          >
            Accept · +{reward}
          </button>
        )}
        {!own && !accepted && isHelping && (
          <span className="flex-1 h-10 rounded-xl bg-amber-500/[0.08] text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/20">
            <HiClock className="text-sm" />
            In progress
          </span>
        )}
        {!own && !accepted && isAwaiting && (
          <span className="flex-1 h-10 rounded-xl bg-blue-500/[0.08] text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-500/20">
            Awaiting approval
          </span>
        )}
        {!own && !accepted && isCompleted && (
          <span className="flex-1 h-10 rounded-xl bg-white/[0.03] text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/[0.08]">
            Completed
          </span>
        )}

        {accepted && isHelping && (
          <button
            onClick={onMarkDone}
            className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            Mark as done
          </button>
        )}
        {accepted && isAwaiting && (
          <span className="flex-1 h-10 rounded-xl bg-blue-500/[0.08] text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-500/20">
            Pending confirmation
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-white/[0.1] bg-white/[0.01] text-center">
      <div className="text-3xl mb-3">🤝</div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiPlus,
  HiTrash,
  HiCheck,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlineStar,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://neighbourhelp-backend.onrender.com";
const API = `${BACKEND_URL}/api`;
const NOMINATIM = "https://nominatim.openstreetmap.org";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function searchPlaces(address, near) {
  const clean = address.trim().replace(/\s+/g, " ");
  const parts = clean.split(",").map((part) => part.trim()).filter(Boolean);

  const queries = [
    clean,
    parts.slice(1).join(", "),
    parts.slice(-3).join(", "),
    parts.slice(-2).join(", "),
  ].filter((query, index, arr) => query && arr.indexOf(query) === index);

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "in",
        q: query,
      });

      if (near) {
        const distance = 0.15;
        params.set(
          "viewbox",
          `${near.lng - distance},${near.lat + distance},${near.lng + distance},${near.lat - distance}`
        );
      }

      const response = await fetch(
        `${NOMINATIM}/search?${params.toString()}`
      );

      if (!response.ok) continue;

      const results = await response.json();

      if (results.length) {
        return results.map((item) => ({
          lat: Number(item.lat),
          lng: Number(item.lon),
          label: item.display_name,
        }));
      }

      await sleep(1100);
    } catch (error) {
      console.error("Address search error:", error);
    }
  }

  return [];
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

    const response = await fetch(
      `${NOMINATIM}/reverse?${params.toString()}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.display_name || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

function PinClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function PinRecenter({ focus }) {
  const map = useMap();

  useEffect(() => {
    if (focus) {
      map.setView([focus.lat, focus.lng], 17);
    }
  }, [map, focus]);

  return null;
}

function PinPicker({ focus, fallback, position, onPick }) {
  const markerRef = useRef(null);
  const initial = focus || position || fallback || {
    lat: 28.6725,
    lng: 77.4355,
  };

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
            dragend() {
              const marker = markerRef.current;
              if (!marker) return;

              const point = marker.getLatLng();
              onPick({ lat: point.lat, lng: point.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([
    "Parcel Receiving",
    "Bank Errands",
    "General Help",
  ]);
  const [profilePic, setProfilePic] = useState("");

  const [homeAddressInput, setHomeAddressInput] = useState("");
  const [homeCoords, setHomeCoords] = useState(null);
  const [gpsNear, setGpsNear] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [mapFocus, setMapFocus] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [geocodingHome, setGeocodingHome] = useState(false);
  const [savingHome, setSavingHome] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("Users");

      if (!stored) {
        navigate("/login");
        return;
      }

      const parsed = JSON.parse(stored);

      if (!parsed || typeof parsed !== "object") {
        navigate("/login");
        return;
      }

      if (parsed.points === undefined) parsed.points = 20;

      setUser(parsed);
      setProfilePic(parsed.profilePic || "");
      setSkills(Array.isArray(parsed.skills) ? parsed.skills : []);
      setHomeAddressInput(parsed.homeAddress || "");

      if (parsed.homeLat != null && parsed.homeLng != null) {
        setHomeCoords({
          lat: Number(parsed.homeLat),
          lng: Number(parsed.homeLng),
        });
      }
    } catch (error) {
      console.error("Profile loading error:", error);
      toast.error("Profile data load nahi hua.");
    }
  }, [navigate]);

  // Safe local save: UI state remains updated even if storage is full.
  const saveUserSafely = (updatedUser) => {
    setUser(updatedUser);

    try {
      localStorage.setItem("Users", JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error("User storage error:", error);

      if (error.name === "QuotaExceededError") {
        toast.error(
          "Browser storage full hai. Profile photo ko remove ya compress karo."
        );
      } else {
        toast.error("Browser mein profile save nahi ho paayi.");
      }

      return false;
    }
  };

  const handleAddSkill = (event) => {
    event.preventDefault();

    const newSkill = skillInput.trim();

    if (!newSkill) {
      toast.error("Skill ka naam likho.");
      return;
    }

    if (!user) {
      toast.error("User data load nahi hua. Dobara login karo.");
      return;
    }

    if (
      skills.some(
        (skill) =>
          String(skill).toLowerCase() === newSkill.toLowerCase()
      )
    ) {
      toast.error("Ye skill pehle se added hai.");
      return;
    }

    const updatedSkills = [...skills, newSkill];
    const updatedUser = { ...user, skills: updatedSkills };

    setSkills(updatedSkills);
    setSkillInput("");

    const saved = saveUserSafely(updatedUser);

    if (saved) {
      toast.success(`${newSkill} added successfully!`);
    }
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    const updatedUser = { ...user, skills: updatedSkills };

    setSkills(updatedSkills);

    const saved = saveUserSafely(updatedUser);

    if (saved) toast.success("Skill removed.");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Image file select karo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo 2 MB se chhoti honi chahiye.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;
      const updatedUser = { ...user, profilePic: image };

      setProfilePic(image);

      if (saveUserSafely(updatedUser)) {
        window.dispatchEvent(new Event("profileUpdated"));
        toast.success("Photo updated.");
      }
    };

    reader.onerror = () => toast.error("Photo read nahi ho paayi.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 text-white">
          <p className="text-sm font-semibold">Profile photo remove karein?</p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);

                const updatedUser = { ...user, profilePic: "" };

                setProfilePic("");
                saveUserSafely(updatedUser);
                window.dispatchEvent(new Event("profileUpdated"));
                toast.success("Photo removed.");
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs"
            >
              Remove
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const handleGeocodeHome = async () => {
    const address = homeAddressInput.trim();

    if (!address) {
      toast.error("House number aur address enter karo.");
      return;
    }

    setGeocodingHome(true);

    try {
      const found = await searchPlaces(address, gpsNear);

      setSuggestions(found);
      setShowMap(true);

      if (found.length) {
        const first = {
          lat: found[0].lat,
          lng: found[0].lng,
        };

        setHomeCoords(first);
        setMapFocus({ ...first, key: Date.now() });

        toast.success(
          "Area mil gaya. Exact ghar ke liye pin adjust karo."
        );
      } else {
        const fallback = gpsNear || {
          lat: 28.6725,
          lng: 77.4355,
        };

        setMapFocus({ ...fallback, key: Date.now() });

        if (!homeCoords) setHomeCoords(fallback);

        toast(
          "House number nahi mila. Map par actual ghar ki location select karo."
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setShowMap(true);
      toast.error("Search fail hui. Map par pin set karo.");
    } finally {
      setGeocodingHome(false);
    }
  };

  const fillFromGps = () => {
    if (!navigator.geolocation) {
      toast.error("Browser GPS support nahi karta.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setGpsNear(point);
        setHomeCoords(point);
        setMapFocus({ ...point, key: Date.now() });
        setSuggestions([]);
        setShowMap(true);

        const reverseAddress = await reverseGeocode(
          point.lat,
          point.lng
        );

        if (reverseAddress) {
          setHomeAddressInput((current) =>
            current.trim() ? current : reverseAddress
          );
        }

        setLocating(false);
        toast.success("Location mil gayi. Pin adjust karke Save karo.");
      },
      (error) => {
        console.error("GPS error:", error);
        setLocating(false);
        toast.error("GPS permission allow karo ya map par pin set karo.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handlePinPick = async (point) => {
    setHomeCoords(point);

    if (!homeAddressInput.trim()) {
      const address = await reverseGeocode(point.lat, point.lng);
      if (address) setHomeAddressInput(address);
    }
  };

  const toggleMap = () => {
    if (!showMap) {
      const point = homeCoords || gpsNear;

      if (point) {
        setMapFocus({ ...point, key: Date.now() });
      } else {
        setMapFocus({
          lat: 28.6725,
          lng: 77.4355,
          key: Date.now(),
        });
      }
    }

    setShowMap((current) => !current);
  };

  const handleSaveHomeLocation = async () => {
    const address = homeAddressInput.trim();

    if (!address) {
      toast.error("House number aur address enter karo.");
      return;
    }

    if (!homeCoords) {
      toast.error("Pehle Pinpoint ya Use my location dabao.");
      setShowMap(true);
      return;
    }

    setSavingHome(true);

    try {
      const response = await fetch(`${API}/users/home-location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          homeAddress: address,
          homeLat: homeCoords.lat,
          homeLng: homeCoords.lng,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Address save failed (${response.status})`
        );
      }

      const updatedUser = {
        ...user,
        homeAddress: data.user?.homeAddress || address,
        homeLat: data.user?.homeLat ?? homeCoords.lat,
        homeLng: data.user?.homeLng ?? homeCoords.lng,
      };

      setHomeAddressInput(updatedUser.homeAddress);
      saveUserSafely(updatedUser);

      toast.success("Home address saved.");
    } catch (error) {
      console.error("Home address save error:", error);

      // Keep the address in this browser even if the server request fails.
      const localUser = {
        ...user,
        homeAddress: address,
        homeLat: homeCoords.lat,
        homeLng: homeCoords.lng,
      };

      saveUserSafely(localUser);

      toast.error(
        `Server par save nahi hua: ${error.message}. Backend route check karo.`
      );
    } finally {
      setSavingHome(false);
    }
  };

  if (!user) return null;

  const hasSavedHome =
    user.homeLat != null && user.homeLng != null;

  const getInitials = (name) =>
    name ? String(name).charAt(0).toUpperCase() : "U";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#050a14] text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[60%] rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-indigo-700/10 blur-[140px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <HiOutlineArrowLeft />
          Back to Home
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] shadow-2xl backdrop-blur-2xl">
          <header className="relative border-b border-white/[0.06] px-6 pb-8 pt-10 sm:px-10">
            <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
              <div className="group relative shrink-0">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-600 to-purple-600/20 blur-xl" />

                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-slate-800 ring-4 ring-[#0a1120] sm:h-32 sm:w-32">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-600 text-4xl font-bold">
                      {getInitials(user.fullname || user.email)}
                    </div>
                  )}
                </div>

                <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100 group-active:opacity-100">
                  <HiOutlineCamera className="text-xl" />
                  <span className="text-[10px] font-semibold uppercase">
                    Change photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {profilePic && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    aria-label="Remove profile photo"
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0a1120] text-slate-300 transition hover:text-red-400"
                  >
                    <HiTrash />
                  </button>
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
                <h1 className="truncate text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {user.fullname || "Neighbour User"}
                </h1>

                <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-400 sm:justify-start">
                  <HiOutlineMail />
                  <span className="truncate">{user.email}</span>
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
                  <HiOutlineShieldCheck className="text-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Verified neighbour
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <HiOutlineStar className="text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Credits
                  </span>
                </div>
                <p className="text-2xl font-bold">{user.points ?? 20}</p>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <HiOutlineLightningBolt className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Skills
                  </span>
                </div>
                <p className="text-2xl font-bold">{skills.length}</p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:col-span-1">
                <div className="mb-2 flex items-center gap-2">
                  <HiOutlineLocationMarker className="text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Home
                  </span>
                </div>
                <p className={`text-sm font-semibold ${hasSavedHome ? "text-emerald-400" : "text-amber-400"}`}>
                  {hasSavedHome ? "Set" : "Not set"}
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <section className="border-b border-white/[0.06] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <HiOutlineLocationMarker className="text-lg text-blue-400" />
                </div>
                <h2 className="text-lg font-bold">Home Address</h2>
              </div>

              <p className="mb-5 text-xs leading-relaxed text-slate-400">
                House number, block, street, area and city enter karo.
              </p>

              <div className="mb-4">
                {homeCoords ? (
                  <span className="inline-flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Pinpointed
                  </span>
                ) : hasSavedHome ? (
                  <span className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-300">
                    <HiCheck />
                    Saved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-amber-300">
                    Setup pending
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={homeAddressInput}
                  onChange={(event) => setHomeAddressInput(event.target.value)}
                  placeholder="C-535B, Gali 4, Brij Vihar, Ghaziabad"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/60"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGeocodeHome}
                    disabled={geocodingHome}
                    className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {geocodingHome ? "Locating..." : "Pinpoint"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveHomeLocation}
                    disabled={savingHome || geocodingHome}
                    className="h-11 flex-1 rounded-xl bg-blue-500 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-400 disabled:opacity-50"
                  >
                    {savingHome ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={fillFromGps}
                  disabled={locating}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/[0.08] text-xs font-semibold text-blue-300 transition hover:bg-blue-500/[0.14] disabled:opacity-50"
                >
                  <HiOutlineLocationMarker />
                  {locating ? "Locating..." : "Use my location"}
                </button>

                <button
                  type="button"
                  onClick={toggleMap}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold transition hover:bg-white/[0.08]"
                >
                  {showMap ? "Hide map" : "Pick on map"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-black/20">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.lat}-${suggestion.lng}-${index}`}
                      type="button"
                      onClick={() => {
                        const point = {
                          lat: suggestion.lat,
                          lng: suggestion.lng,
                        };

                        setHomeCoords(point);
                        setMapFocus({ ...point, key: Date.now() });
                        setShowMap(true);
                      }}
                      className="block w-full border-b border-white/5 px-3 py-2.5 text-left text-xs text-slate-300 transition last:border-0 hover:bg-white/[0.06]"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}

              {showMap && (
                <div className="mt-3">
                  <div className="relative z-0 h-64 w-full overflow-hidden rounded-2xl border border-white/10">
                    <PinPicker
                      focus={mapFocus}
                      fallback={gpsNear}
                      position={homeCoords}
                      onPick={handlePinPick}
                    />
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                    Map par apne actual ghar ki jagah tap karo ya pin drag
                    karo. Phir Save dabao.
                  </p>
                </div>
              )}

              {homeCoords && (
                <p className="mt-3 break-all font-mono text-[10px] text-slate-400">
                  Coordinates: {homeCoords.lat.toFixed(6)},{" "}
                  {homeCoords.lng.toFixed(6)}
                </p>
              )}

              {user.homeAddress && (
                <p className="mt-3 break-words text-xs text-slate-300">
                  <span className="text-slate-500">Saved address: </span>
                  {user.homeAddress}
                </p>
              )}
            </section>

            <section className="p-6 sm:p-8">
              <div className="mb-1 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                  <HiOutlineLightningBolt className="text-lg text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold">Skills</h2>
              </div>

              <p className="mb-6 text-xs leading-relaxed text-slate-400">
                Neighbours ko jin errands mein help kar sakte ho, woh add karo.
              </p>

              <form
                onSubmit={handleAddSkill}
                className="mb-5 flex gap-2"
              >
                <input
                  type="text"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  placeholder="Grocery pickup, Quick fix..."
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/60"
                />

                <button
                  type="submit"
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-500"
                >
                  <HiPlus />
                  Add
                </button>
              </form>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Your skills
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                  {skills.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {skills.map((skill, index) => (
                    <motion.div
                      key={`${skill}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-3 pr-1.5 text-xs"
                    >
                      <span className="break-words font-medium text-slate-200">
                        {skill}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remove ${skill}`}
                        onClick={() => handleRemoveSkill(index)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <HiTrash />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!skills.length && (
                  <p className="py-2 text-xs italic text-slate-500">
                    Abhi koi skill nahi hai. Upar se add karo.
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.05] p-3">
                <p className="text-xs leading-relaxed text-slate-400">
                  Example skills: Grocery Pickup, Parcel Receiving,
                  Bank Errands, Tutoring, Pet Walking.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

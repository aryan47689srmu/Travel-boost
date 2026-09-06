import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useCurrency } from "../context/CurrencyContext";
import { Circle, CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Categories backed by real TravelBoost data (queried by lat/lng against our own API).
const dataCategories = [
  {
    key: "hotels",
    title: "Nearby Hotels",
    icon: "🏨",
    kind: "hotels",
    blurb: "Live results from TravelBoost's hotel listings.",
  },
  {
    key: "attractions",
    title: "Tourist Attractions",
    icon: "🎯",
    kind: "experiences",
    blurb: "Bookable experiences from TravelBoost near you.",
  },
  {
    key: "transport",
    title: "Transport",
    icon: "🚕",
    kind: "services",
    serviceTypes: "Taxi,Airport Transfer,Bus,Car Rental",
    blurb: "Verified local transport partners on TravelBoost.",
  },
  {
    key: "guides",
    title: "Local Guides",
    icon: "🧑‍💼",
    kind: "services",
    serviceTypes: "Local Guide",
    blurb: "Local guides listed on TravelBoost.",
  },
];

// Categories TravelBoost has no listings for yet — these still go to Google Maps.
const externalCategories = [
  {
    key: "restaurants",
    title: "Food & Restaurants",
    icon: "🍴",
    mapsQuery: "restaurants",
    blurb: "Not on TravelBoost yet — opens Google Maps.",
  },
  {
    key: "safety",
    title: "Safety & Help",
    icon: "🛡️",
    mapsQuery: "police hospital emergency services",
    blurb: "Always use official channels — opens Google Maps.",
  },
];

const radiusOptions = [5, 10, 25, 50, 100];

const kindConfig = {
  hotels: { endpoint: "/hotels", detailPath: "/hotels" },
  experiences: { endpoint: "/experiences", detailPath: "/experiences" },
  services: { endpoint: "/travel-services", detailPath: "/travel-services" },
};

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 14));
  }, [location, map]);

  return null;
}

export default function LocationTracker() {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState(
    "Share your location to discover nearby tourism services."
  );
  const [loading, setLoading] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [showingAllListings, setShowingAllListings] = useState(false);
  const watchId = useRef(null);

  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current);
  }, []);

  function updateLocation({ coords }) {
    setLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
    });
  }

  function track() {
    if (!navigator.geolocation) {
      setMessage("Location tracking is not supported by this browser.");
      return;
    }

    setLoading(true);
    setMessage("Finding your current location…");

    const onLocationSuccess = (position) => {
        updateLocation(position);
        setActiveCategory(null);
        setResults([]);
        setResultsError(null);
        setShowingAllListings(false);

        setLoading(false);
        setMessage(
          "Location found! Choose a category below to explore nearby places."
        );
    };

    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      (error) => {
        setLoading(false);

        if (error.code === 1) {
          setMessage(
            "Location permission was denied. Allow location access in your browser and try again."
          );
        } else if (error.code === 2) {
          setMessage(
            "Your location could not be detected. Please check GPS/location services."
          );
        } else if (error.code === 3) {
          setMessage("Location request timed out. Please try again.");
        } else {
          setMessage("Unable to get your location. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );

    watchId.current = navigator.geolocation.watchPosition(updateLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    });
  }

  function mapsSearch(query = "") {
    if (!location) return "#";

    const searchQuery = query
      ? `${query} near ${location.latitude},${location.longitude}`
      : `${location.latitude},${location.longitude}`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      searchQuery
    )}`;
  }

  async function loadResults(category, radius = radiusKm, currentLocation = location) {
    if (!currentLocation) return;

    setActiveCategory(category);
    setResultsLoading(true);
    setResultsError(null);
    setResults([]);
    setShowingAllListings(false);

    try {
      const { endpoint } = kindConfig[category.kind];
      const params = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        radius,
      };
      if (category.serviceTypes) params.type = category.serviceTypes;

      const { data } = await api.get(endpoint, { params });
      const nearbyResults = Array.isArray(data) ? data : [];

      if (category.kind === "hotels" && nearbyResults.length === 0) {
        const allListings = await api.get(endpoint);
        setResults(Array.isArray(allListings.data) ? allListings.data : []);
        setShowingAllListings(true);
      } else {
        setResults(nearbyResults);
      }
    } catch (err) {
      setResultsError(
        err.response?.data?.message ||
          "Could not load nearby results from TravelBoost. Please try again."
      );
    } finally {
      setResultsLoading(false);
    }
  }

  function handleRadiusChange(newRadius) {
    setRadiusKm(newRadius);
    if (activeCategory) loadResults(activeCategory, newRadius);
  }

  function priceOf(item) {
    return item.pricePerNight ?? item.price;
  }

  function subtitleOf(item, kind) {
    if (kind === "hotels") return item.destination;
    if (kind === "experiences") return `${item.destination} · ${item.category}`;
    return `${item.destination} · ${item.type}`;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">📍 Near Me</h1>

        <p className="mt-1 text-sm text-gray-500">
          Discover hotels, attractions, transport and guides listed on
          TravelBoost around your current location.
        </p>
      </div>

      {/* Location Card */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {location ? (
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={14}
            scrollWheelZoom
            className="h-64 w-full rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap location={location} />
            <CircleMarker
              center={[location.latitude, location.longitude]}
              radius={9}
              pathOptions={{ color: "#4a18c9", fillColor: "#6d3bff", fillOpacity: 1 }}
            />
            <Circle
              center={[location.latitude, location.longitude]}
              radius={location.accuracy}
              pathOptions={{ color: "#6d3bff", fillColor: "#b3a1ff", fillOpacity: 0.2 }}
            />
          </MapContainer>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300">
            <div className="text-center"><div className="text-6xl">📍</div><p className="mt-3 text-sm font-medium text-gray-700">Location not detected</p></div>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-600">{message}</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={track}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Finding location…"
              : location
              ? "🔄 Refresh Location"
              : "📍 Use My Current Location"}
          </button>

        </div>

        {location && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Latitude</p>
              <p className="mt-1 font-semibold text-gray-800">
                {location.latitude.toFixed(5)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Longitude</p>
              <p className="mt-1 font-semibold text-gray-800">
                {location.longitude.toFixed(5)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">Accuracy</p>
              <p className="mt-1 font-semibold text-gray-800">
                ±{Math.round(location.accuracy)} m
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Nearby Categories */}
      {location ? (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Explore Nearby
              </h2>
              <p className="text-sm text-gray-500">
                Hotels, attractions, transport and guides pull live results
                from TravelBoost. Choose a category to search listings near
                your current location.
              </p>
            </div>

            {activeCategory && (
              <label className="text-xs text-gray-500">
                Radius:{" "}
                <select
                  value={radiusKm}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="ml-1 rounded-lg border border-gray-200 px-2 py-1 text-xs"
                >
                  {radiusOptions.map((r) => (
                    <option key={r} value={r}>
                      {r} km
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataCategories.map((category) => (
              <button
                key={category.key}
                onClick={() => loadResults(category)}
                className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  activeCategory?.key === category.key
                    ? "border-brand-400 ring-2 ring-brand-100"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                    {category.icon}
                  </div>
                  <span className="text-gray-300 transition group-hover:text-brand-600">
                    →
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-gray-800">
                  {category.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {category.blurb}
                </p>

                <p className="mt-4 text-xs font-semibold text-brand-600">
                  Search TravelBoost →
                </p>
              </button>
            ))}

            {externalCategories.map((category) => (
              <a
                key={category.key}
                href={mapsSearch(category.mapsQuery)}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                    {category.icon}
                  </div>
                  <span className="text-gray-300 transition group-hover:text-brand-600">
                    ↗
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-gray-800">
                  {category.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {category.blurb}
                </p>

                <p className="mt-4 text-xs font-semibold text-gray-500">
                  Open Google Maps →
                </p>
              </a>
            ))}
          </div>

          {/* Results panel */}
          {activeCategory && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {activeCategory.icon} {activeCategory.title}{" "}
                  {showingAllListings
                    ? "listed on TravelBoost"
                    : `within ${radiusKm} km`}
                </h3>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕ Close
                </button>
              </div>

              {resultsLoading && (
                <p className="text-sm text-gray-400">Searching nearby…</p>
              )}

              {!resultsLoading && resultsError && (
                <p className="text-sm text-red-500">{resultsError}</p>
              )}

              {!resultsLoading && !resultsError && results.length === 0 && (
                <p className="text-sm text-gray-400">
                  No {activeCategory.title.toLowerCase()} listed on
                  TravelBoost yet.
                </p>
              )}

              {!resultsLoading && !resultsError && results.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {item.name || item.title}
                        </h4>
                        {item.distanceKm != null && (
                          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                            {item.distanceKm} km
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        {subtitleOf(item, activeCategory.kind)}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-500">
                          ⭐ {item.rating || "New"}
                        </span>
                        {priceOf(item) != null && (
                          <span className="font-bold text-brand-700">
                            {formatCurrency(priceOf(item))}
                          </span>
                        )}
                      </div>

                      <button
                        disabled={activeCategory.kind === "services"}
                        onClick={() => {
                          if (item._id && activeCategory.kind === "hotels") {
                            navigate(`/hotels/${item._id}`);
                            return;
                          }
                          if (activeCategory.kind !== "services") {
                            navigate(kindConfig[activeCategory.kind].detailPath);
                          }
                        }}
                        className="mt-3 w-full rounded-lg bg-brand-50 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                      >
                        {activeCategory.kind === "services" ? "Available near you" : "View & Book"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <div className="text-4xl">🗺️</div>

          <h2 className="mt-3 font-semibold text-gray-800">
            Find places around you
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Allow location access to discover nearby hotels, attractions,
            transport, guides and emergency services.
          </p>
        </section>
      )}

      {/* Safety */}
      <section className="rounded-2xl border border-green-100 bg-green-50 p-5">
        <div className="flex gap-3">
          <div className="text-2xl">🛡️</div>

          <div>
            <h2 className="font-semibold text-green-800">Travel Safety</h2>

            <p className="mt-1 text-sm leading-6 text-green-700">
              For important decisions, verify prices, business identity,
              reviews and official information before paying or sharing
              personal details. Emergency services should always be
              contacted through official channels.
            </p>

            {location && (
              <a
                href={mapsSearch("police station hospital emergency services")}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-green-800 underline"
              >
                Find nearby help →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <p className="text-center text-xs text-gray-400">
        🔒 Your location is sent to TravelBoost only to search nearby
        listings — it is not saved.
      </p>
    </div>
  );
}
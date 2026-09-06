import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import PlaceCard from "../components/PlaceCard";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPlaces(searchDestination = destination) {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (searchDestination.trim()) {
        params.destination = searchDestination.trim();
      }

      const { data } = await api.get("/places", {
        params,
      });

      setPlaces(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Could not load places. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const destinationFromUrl =
      searchParams.get("destination") || "";

    setDestination(destinationFromUrl);

    loadPlaces(destinationFromUrl);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleSearch(e) {
    e.preventDefault();

    const value = destination.trim();

    if (value) {
      setSearchParams({
        destination: value,
      });
    } else {
      setSearchParams({});
    }
  }

  function clearSearch() {
    setDestination("");
    setSearchParams({});
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Explore Places
        </h1>

        <p className="mt-2 text-gray-500">
          Discover amazing places and hidden gems around India.
        </p>
      </div>


      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
      >
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Search a destination, e.g. Varanasi"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />

        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white px-7 py-3 rounded-xl font-semibold"
        >
          Search
        </button>

        {destination && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>


      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {destination
              ? `Places in ${destination}`
              : "Discover Places"}
          </h2>

          {!destination && (
            <p className="text-sm text-gray-500 mt-1">
              Explore destinations picked for you.
            </p>
          )}
        </div>

        {!loading && (
          <span className="text-sm text-gray-400">
            {places.length} places
          </span>
        )}
      </div>


      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <p className="text-gray-400">
            Discovering places...
          </p>
        </div>
      )}


      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-600 text-sm">
          {error}
        </div>
      )}


      {/* Cards */}
      {!loading && !error && (
        <>
          {places.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place._id}
                  place={place}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-lg font-semibold text-gray-700">
                No places found
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Try another destination.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import HotelCard from "../components/HotelCard";

export default function Hotels() {
  const location = useLocation();

  const [destination, setDestination] = useState("");
  const [sort, setSort] = useState("rating");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search(nextDestination = destination) {
    setLoading(true);

    try {
      const { data } = await api.get("/hotels", {
        params: {
          destination: nextDestination,
          sort,
        },
      });

      setHotels(data);
    } catch (error) {
      console.error("Failed to load hotels:", error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const nextDestination =
      new URLSearchParams(location.search).get("destination") || "";

    setDestination(nextDestination);

    search(nextDestination);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hotels
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Find the perfect stay for your trip.
        </p>
      </div>


      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100">

        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination (e.g. Goa, Manali)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="rating">
            Top rated
          </option>

          <option value="price_asc">
            Price: Low to High
          </option>

          <option value="price_desc">
            Price: High to Low
          </option>
        </select>

        <button
          onClick={() => search()}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-semibold"
        >
          Search
        </button>
      </div>


      {loading ? (
        <p className="text-sm text-gray-400">
          Loading hotels...
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {hotels.map((hotel) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
            />
          ))}

          {hotels.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">
              No hotels found. Try a different destination.
            </p>
          )}

        </div>
      )}
    </div>
  );
}
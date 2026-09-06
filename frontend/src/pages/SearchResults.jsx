import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import HotelCard from "../components/HotelCard";
import ExperienceCard from "../components/ExperienceCard";
import { useCurrency } from "../context/CurrencyContext";

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const query = params.get("q") || "";
  const [results, setResults] = useState({ hotels: [], experiences: [], services: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults({ hotels: [], experiences: [], services: [] });
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/hotels", { params: { q: query } }),
      api.get("/experiences", { params: { q: query } }),
      api.get("/travel-services", { params: { q: query } }),
    ])
      .then(([hotels, experiences, services]) => {
        if (active) setResults({
          hotels: Array.isArray(hotels.data) ? hotels.data : [],
          experiences: Array.isArray(experiences.data) ? experiences.data : [],
          services: Array.isArray(services.data) ? services.data : [],
        });
      })
      .catch(() => active && setError("Could not complete the search. Please try again."))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [query]);

  const total = results.hotels.length + results.experiences.length + results.services.length;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Search results</h1>
        <p className="mt-1 text-sm text-gray-500">Results for “{query}” across TravelBoost.</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Searching TravelBoost...</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && total === 0 && <p className="text-sm text-gray-400">No hotels, experiences, or services matched your search.</p>}

      {!loading && results.hotels.length > 0 && <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-bold text-gray-800">Hotels</h2><Link to={`/explore?destination=${encodeURIComponent(query)}`} className="text-sm text-brand-600">View all</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{results.hotels.map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}</div>
      </section>}

      {!loading && results.experiences.length > 0 && <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-bold text-gray-800">Experiences</h2><Link to={`/experiences?destination=${encodeURIComponent(query)}`} className="text-sm text-brand-600">View all</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{results.experiences.map((experience) => <ExperienceCard key={experience._id} exp={experience} onBook={() => navigate(`/experiences?destination=${encodeURIComponent(experience.destination)}`)} />)}</div>
      </section>}

      {!loading && results.services.length > 0 && <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-bold text-gray-800">Travel services</h2><Link to={`/travel-services?destination=${encodeURIComponent(query)}`} className="text-sm text-brand-600">View all</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.services.map((service) => <article key={service._id} className="rounded-xl border border-gray-100 bg-white p-5"><p className="text-xs font-semibold text-brand-700">{service.type}</p><h3 className="mt-2 font-semibold text-gray-800">{service.title}</h3><p className="mt-1 text-sm text-gray-500">{service.destination}</p><p className="mt-3 text-sm text-gray-600">{service.description || "Verified local travel support."}</p><p className="mt-3 font-bold text-brand-700">{formatCurrency(service.price)}</p></article>)}</div>
      </section>}
    </div>
  );
}

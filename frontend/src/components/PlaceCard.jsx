import { Link } from "react-router-dom";

export default function PlaceCard({ place }) {
  const image =
    place.images?.[0] ||
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80";

  return (
    <Link
      to={`/explore/${place._id}`}
      className="group block overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition"
    >
      <div className="h-52 overflow-hidden">
        <img
          src={image}
          alt={place.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold text-gray-800 truncate">
            {place.name}
          </h2>

          {place.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 whitespace-nowrap">
              {place.category}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {place.destination}
          {place.state ? `, ${place.state}` : ""}
        </p>

        {place.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {place.description}
          </p>
        )}
      </div>
    </Link>
  );
}
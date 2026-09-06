import { Link } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";

export default function HotelCard({ hotel }) {
  const { formatCurrency } = useCurrency();
  const image = hotel.images?.find((value) => value && !value.startsWith("data:application/pdf")) || hotel.image || hotel.imageUrl;
  return (
    <Link
      to={`/hotels/${hotel._id}`}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition cursor-pointer"
    >
      <div className="h-44 bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={hotel.name || "Hotel"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🏨
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base">
          {hotel.name || "Unnamed Hotel"}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          📍 {hotel.destination || hotel.location?.city || "India"}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-semibold text-yellow-600">
            ⭐ {hotel.rating || 0}
          </span>

          <span className="font-bold text-brand-600">
            {formatCurrency(hotel.pricePerNight || hotel.price || 0)}
            <span className="text-xs text-gray-400 font-normal">
              {" "}
              / night
            </span>
          </span>
        </div>

        <div className="mt-3 text-center bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold">
          View & Book
        </div>
      </div>
    </Link>
  );
}

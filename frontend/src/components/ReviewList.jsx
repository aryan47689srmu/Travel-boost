import { useEffect, useState } from "react";
import api from "../api/client";

export default function ReviewList({ itemType, itemId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get("/reviews", { params: { itemType, item: itemId } })
      .then(({ data }) => {
        if (active) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [itemType, itemId]);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-800">User reviews</h2>
        <span className="text-xs text-gray-400">Verified bookings only</span>
      </div>

      {loading && <p className="mt-4 text-sm text-gray-400">Loading reviews...</p>}
      {!loading && reviews.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">No reviews yet. Users can review after their booked date.</p>
      )}
      {!loading && reviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-800">{review.user?.name || "TravelBoost user"}</p>
                <span className="text-sm text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
              </div>
              {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const statusColor = {
  confirmed: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-gray-100 text-gray-600",
};

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    api.get("/bookings/mine")
      .then((res) => {
        setBookings(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Bookings fetch error:", err);
        setError(
          err.response?.data?.message ||
          "Failed to load bookings"
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function cancel(id) {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to cancel booking"
      );
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    try {
      await api.post("/reviews", {
        booking: reviewing._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setBookings((prev) => prev.map((booking) => (
        booking._id === reviewing._id ? { ...booking, reviewed: true } : booking
      )));
      setReviewing(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    }
  }

  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        Please{" "}
        <Link to="/login" className="text-brand-600 font-medium">
          sign in
        </Link>{" "}
        to view your bookings.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-gray-400">Loading bookings...</p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-sm text-gray-400">
          You have no bookings yet.
        </p>
      )}

      {bookings.map((b) => (
        <div
          key={b._id}
          className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-lg bg-brand-50 flex items-center justify-center text-2xl">
            {b.itemType === "Hotel" ? "🏨" : "🎈"}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {b.item?.name || b.item?.title || "Booked Item"}
            </p>

            <p className="text-xs text-gray-500">
              {new Date(b.checkIn).toLocaleDateString()}
              {b.checkOut &&
                ` - ${new Date(b.checkOut).toLocaleDateString()}`}
            </p>
          </div>

          <span className="font-semibold text-brand-700">
            ₹{b.totalPrice}
          </span>

          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              statusColor[b.status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {b.status}
          </span>

          {b.status === "confirmed" && (
            <button
              onClick={() => cancel(b._id)}
              className="text-xs text-red-600 font-medium"
            >
              Cancel
            </button>
          )}

          {["completed", "confirmed"].includes(b.status) &&
            new Date(b.checkOut || b.checkIn) <= new Date() &&
            !b.reviewed && (
            <button
              onClick={() => { setReviewing(b); setReviewForm({ rating: 5, comment: "" }); }}
              className="text-xs font-medium text-brand-600"
            >
              Review
            </button>
          )}
        </div>
      ))}

      {reviewing && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
          <form onSubmit={submitReview} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-gray-800">Review your experience</h2>
                <p className="text-sm text-gray-500">{reviewing.item?.name || reviewing.item?.title || "Your booking"}</p>
              </div>
              <button type="button" onClick={() => setReviewing(null)} className="text-gray-400">✕</button>
            </div>
            <label className="block text-sm font-medium text-gray-700">Rating
              <select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })} className="mt-1 w-full rounded-lg border p-2">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
            </label>
            <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} placeholder="What did you think?" className="min-h-24 w-full rounded-lg border p-2 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white">Submit verified review</button>
          </form>
        </div>
      )}
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import api from "../api/client";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { currency, currencies, chooseCurrency } = useCurrency();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const actionsRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setMenu(null);
      }
    }

    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return undefined;
    }

    let active = true;
    const loadBookings = () => {
      api.get("/bookings/mine")
        .then(({ data }) => {
          if (active) setBookings(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    };

    loadBookings();
    const timer = window.setInterval(loadBookings, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [user]);

  function bookingTitle(booking) {
    return booking.item?.name || booking.item?.title || "Your booking";
  }

  function bookingDates(booking) {
    const start = new Date(booking.checkIn).toLocaleDateString();
    const end = booking.checkOut ? ` - ${new Date(booking.checkOut).toLocaleDateString()}` : "";
    return `${start}${end}`;
  }

  function isUpcoming(booking) {
    const start = new Date(booking.checkIn).getTime();
    const daysUntil = (start - Date.now()) / 86400000;
    return booking.status === "confirmed" && daysUntil >= 0 && daysUntil <= 7;
  }

  function selectCurrency(value) {
    chooseCurrency(value);
    setMenu(null);
  }

  function signOut() {
    logout();
    setMenu(null);
    navigate("/");
  }

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5 sm:py-4 lg:flex-nowrap lg:gap-4 lg:px-6">
      <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 xl:hidden">
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
      </button>
      <form onSubmit={(event) => { event.preventDefault(); if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); }} className="relative order-last min-w-0 basis-full flex-1 lg:order-none lg:basis-auto lg:max-w-md">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Where do you want to go?" className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
      </form>

      <div ref={actionsRef} className="relative ml-auto flex min-w-0 items-center gap-1 text-sm sm:gap-3">
        <div className="relative">
          <button onClick={() => setMenu(menu === "currency" ? null : "currency")} className="rounded-lg px-2 py-2 text-gray-600 hover:bg-gray-50">{currency} ▾</button>
          {menu === "currency" && <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-xs text-gray-400">Display currency</p>
            {Object.entries(currencies).map(([code, option]) => <button key={code} onClick={() => selectCurrency(code)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50">{option.symbol} {option.label} ({code}) {currency === code && "✓"}</button>)}
            <p className="px-2 pt-2 text-[11px] text-gray-400">Prices are converted from INR for display.</p>
          </div>}
        </div>

        <div className="relative">
          <button onClick={() => setMenu(menu === "notifications" ? null : "notifications")} aria-label="Notifications" className="relative rounded-lg p-2 text-lg hover:bg-gray-50">🔔{bookings.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{bookings.length}</span>}</button>
          {menu === "notifications" && <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-3 shadow-lg"><p className="mb-2 font-semibold text-gray-800">Notifications</p>{user ? <>{bookings.length > 0 ? <div className="max-h-64 space-y-2 overflow-y-auto">{bookings.slice(0, 5).map((booking) => <div key={booking._id} className={`rounded-lg p-3 text-xs ${isUpcoming(booking) ? "bg-amber-50 text-amber-900" : "bg-brand-50 text-brand-800"}`}><p className="font-semibold">{isUpcoming(booking) ? "Upcoming booking" : "Booking confirmed"}</p><p className="mt-1">{bookingTitle(booking)}</p><p className="mt-1">Date: {bookingDates(booking)}</p></div>)}</div> : <div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800">No bookings yet. Your booking updates will appear here.</div>}<Link onClick={() => setMenu(null)} to="/bookings" className="mt-2 block text-xs font-medium text-brand-600">View my bookings →</Link></> : <p className="text-xs text-gray-500">Sign in to receive booking updates and travel reminders.</p>}</div>}
        </div>

        {user ? <div className="relative">
          <button onClick={() => setMenu(menu === "profile" ? null : "profile")} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{user.name?.[0]?.toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block font-medium leading-none text-gray-800">Hi, {user.name.split(" ")[0]}</span><span className="mt-1 block text-xs text-gray-400">My account ▾</span></span></button>
          {menu === "profile" && <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"><div className="border-b px-3 py-2"><p className="font-medium text-gray-800">{user.name}</p><p className="truncate text-xs text-gray-400">{user.email}</p></div><Link onClick={() => setMenu(null)} to="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">My profile</Link><Link onClick={() => setMenu(null)} to="/bookings" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">My bookings</Link>{["vendor", "admin"].includes(user.role) && <Link onClick={() => setMenu(null)} to="/vendor/onboarding" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">Vendor dashboard</Link>}<button onClick={signOut} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button></div>}
        </div> : <Link to="/login" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">Sign in</Link>}
      </div>
    </header>
  );
}

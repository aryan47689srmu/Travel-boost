import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { currency, currencies, chooseCurrency } = useCurrency();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function closeMenu(event) {
      if (!event.target.closest("button")) setMenu(null);
    }

    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

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
    <header className="flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-4">
      <form onSubmit={(event) => { event.preventDefault(); navigate(`/explore?destination=${encodeURIComponent(query)}`); }} className="relative max-w-md flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="Where do you want to go?" className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
      </form>

      <div className="relative ml-auto flex items-center gap-3 text-sm">
        <div className="relative">
          <button onClick={() => setMenu(menu === "currency" ? null : "currency")} className="rounded-lg px-2 py-2 text-gray-600 hover:bg-gray-50">{currency} ▾</button>
          {menu === "currency" && <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-xs text-gray-400">Display currency</p>
            {Object.entries(currencies).map(([code, option]) => <button key={code} onClick={() => selectCurrency(code)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50">{option.symbol} {option.label} ({code}) {currency === code && "✓"}</button>)}
            <p className="px-2 pt-2 text-[11px] text-gray-400">Prices are converted from INR for display.</p>
          </div>}
        </div>

        <div className="relative">
          <button onClick={() => setMenu(menu === "notifications" ? null : "notifications")} aria-label="Notifications" className="rounded-lg p-2 text-lg hover:bg-gray-50">🔔</button>
          {menu === "notifications" && <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-lg"><p className="mb-2 font-semibold text-gray-800">Notifications</p>{user ? <><div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800">Welcome, {user.name}. Your bookings and local-tourism offers are ready to manage.</div><Link onClick={() => setMenu(null)} to="/bookings" className="mt-2 block text-xs font-medium text-brand-600">View my bookings →</Link></> : <p className="text-xs text-gray-500">Sign in to receive booking updates and travel reminders.</p>}</div>}
        </div>

        {user ? <div className="relative">
          <button onClick={() => setMenu(menu === "profile" ? null : "profile")} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">{user.name?.[0]?.toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block font-medium leading-none text-gray-800">Hi, {user.name.split(" ")[0]}</span><span className="mt-1 block text-xs text-gray-400">My account ▾</span></span></button>
          {menu === "profile" && <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"><div className="border-b px-3 py-2"><p className="font-medium text-gray-800">{user.name}</p><p className="truncate text-xs text-gray-400">{user.email}</p></div><Link onClick={() => setMenu(null)} to="/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">My profile</Link><Link onClick={() => setMenu(null)} to="/bookings" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">My bookings</Link>{["vendor", "admin"].includes(user.role) && <Link onClick={() => setMenu(null)} to="/vendor/onboarding" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50">Vendor dashboard</Link>}<button onClick={signOut} className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button></div>}
        </div> : <Link to="/login" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">Sign in</Link>}
      </div>
    </header>
  );
}

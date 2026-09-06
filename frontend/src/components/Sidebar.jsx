import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/explore", label: "Explore", icon: "🧭" },
  { to: "/bookings", label: "Bookings", icon: "🗂️" },
  { to: "/hotels", label: "Hotels", icon: "🏨" },
  { to: "/experiences", label: "Experiences", icon: "🎈" },
  { to: "/travel-services", label: "Travel Services", icon: "🚕" },
  { to: "/tracker", label: "Near Me", icon: "📍" },
  { to: "/planner", label: "AI Planner", icon: "✨", badge: "New" },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const vendorDestination = user && ["vendor", "admin"].includes(user.role)
    ? "/vendor/onboarding"
    : "/register?role=vendor";

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-gray-100 bg-white px-3 py-4 shadow-xl transition-transform duration-200 xl:sticky xl:top-0 xl:z-auto xl:h-screen xl:w-60 xl:max-w-none xl:shrink-0 xl:translate-x-0 xl:overflow-hidden xl:shadow-none ${open ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}`}>
      <Link to="/" className="mb-5 flex items-center gap-2 px-2">
        <span className="text-brand-600 text-2xl">✈️</span>
        <div>
          <p className="font-extrabold text-lg leading-none">
            Travel<span className="text-brand-600">Boost</span>
          </p>
          <p className="text-[11px] text-gray-400 tracking-wide">Explore. Experience. Excel.</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <span>{l.icon}</span>
            <span className="flex-1">{l.label}</span>
            {l.badge && (
              <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-semibold">
                {l.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-3 text-white">
        <p className="text-sm font-semibold leading-tight">List your buisness</p>
        <p className="mb-2 mt-1 text-[11px] leading-tight text-brand-100">Grow your business with us</p>
        <NavLink
          to={vendorDestination}
          className="block rounded-lg bg-white py-1.5 text-center text-xs font-semibold text-brand-700"
        >
          Get Started →
        </NavLink>
      </div>
    </aside>
  );
}

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useState } from "react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-gray-900/40 xl:hidden" />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

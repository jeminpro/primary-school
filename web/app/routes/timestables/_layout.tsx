import { Outlet, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Calculator } from "lucide-react";

export default function TimesTablesLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const bottomIllustration = `url('data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="799.403" height="200" viewBox="0 0 799.403 441.595" opacity="0.9" role="img"><rect width="100%" height="100%" fill="none"/><g fill="#e5e7eb" opacity="0.6"><circle cx="80" cy="120" r="30"/><rect x="140" y="90" width="80" height="20" rx="10"/><rect x="240" y="110" width="120" height="20" rx="10"/></g></svg>
  `)}')`;

  const topIllustration = `url('data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="859" height="160" viewBox="0 0 859 160" opacity="0.3" role="img"><rect width="100%" height="100%" fill="none"/><g fill="#c7d2fe" opacity="0.4"><rect x="40" y="10" width="120" height="20" rx="10"/><circle cx="220" cy="30" r="14"/><rect x="260" y="20" width="80" height="20" rx="10"/></g></svg>
  `)}')`;

  return (
    <div
      className="min-h-screen bg-illustrations"
      style={{
        backgroundColor: '#f3f4f6',
        backgroundImage: `${topIllustration}, ${bottomIllustration}`,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'top left, bottom right'
      }}
    >
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const atIndex = location.pathname === "/timestables" || location.pathname === "/timestables/";
              if (atIndex) navigate("/"); else navigate("/timestables");
            }}
          > 
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2">
            <Calculator size={28} /> Times Tables
          </h1>
          <div className="w-12" aria-hidden></div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

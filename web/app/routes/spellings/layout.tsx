import { Outlet } from "react-router";
import { BookOpen } from "lucide-react";

export default function SpellingsLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-teal-100">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-primary flex items-center justify-center gap-3">
          <span className="flex items-center"><BookOpen size={32} /></span>
          <span className="flex items-center">Spellings</span>
        </h1>
        <Outlet />
      </div>
    </div>
  );
}
import React from "react";
import { Outlet } from "react-router";

export default function SpellingsLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-orange-100">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-orange-500 drop-shadow-lg">
          📝 Spellings
        </h1>
        <Outlet />
      </div>
    </div>
  );
}

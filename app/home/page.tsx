"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    // This page should only show if user is logged in.
    // Redirect is handled in AuthContext.
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.displayName}</h1>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

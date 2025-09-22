"use client";

import { useAuth } from "@/context/AuthContext";
import RoleManager from "@/components/RoleManager";

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>

      <p className="text-lg">
        Your role:{" "}
        <span className="uppercase text-blue-600 font-bold">{user.role}</span>
      </p>

      {user.role === "SUPERUSER" && <RoleManager />}

      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

"use client";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>Your User Number: {user?.userNumber || "Loading..."}</p>
      <p>Your Role: {user?.role}</p>
    </div>
  );
}

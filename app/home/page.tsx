"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

function UploadComponent() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // Only allow DEV or SUPERUSER to access this UI
  if (user?.role !== "DEV" && user?.role !== "SUPERUSER") {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-id": user.uid,
        },
      });

      if (!res.ok) throw new Error("Upload failed");

      setMessage("Upload successful!");
    } catch (error) {
      setMessage("Upload failed, try again.");
      console.error(error);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Upload Files</h2>
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [becomingDev, setBecomingDev] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const becomeDeveloper = async () => {
    setBecomingDev(true);
    setMessage("");

    try {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, { role: "DEV" });
      setMessage("You are now a developer!");
      // Optionally refresh auth context to get updated role
    } catch (error) {
      setMessage("Failed to update role.");
      console.error(error);
    } finally {
      setBecomingDev(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{user.displayName || user.email}</h1>

      <p className="text-lg">
        Your role:{" "}
        <span className="uppercase text-blue-600 font-bold">{user.role}</span>
      </p>

      {user.role !== "DEV" && user.role !== "SUPERUSER" && (
        <button
          onClick={becomeDeveloper}
          disabled={becomingDev}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          {becomingDev ? "Processing..." : "Become a Developer"}
        </button>
      )}


      {message && <p>{message}</p>}

      <UploadComponent />

      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

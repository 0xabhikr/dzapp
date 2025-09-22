"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface UserType {
  uid: string; // Firebase UID
  email?: string;
  role?: "USER" | "ADMIN" | "SUPERUSER" | "MODDEV";
  userNumber?: string; // your custom 8-digit number
}

export default function RoleManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const list: UserType[] = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserType, "uid">),
      }));
      setUsers(list);
    };

    if (user?.role === "SUPERUSER") {
      fetchUsers();
    }
  }, [user]);

  const updateRole = async (targetUid: string, newRole: string) => {
    if (!user?.uid) {
      alert("User not authenticated");
      return;
    }

    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterUid: user.uid, 
          targetUid,
          newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || "Unknown error"}`);
        return;
      }

      alert(`Role changed to ${newRole}`);

      // Refresh users after change
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const list: UserType[] = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserType, "uid">),
      }));
      setUsers(list);
    } catch (err) {
      alert("Failed to update role");
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
      {users.map((u) => (
        <div
          key={u.uid}
          className="border p-3 mb-2 flex justify-between items-center"
        >
          <div>
            <p>Email: {u.email}</p>
            <p>User Number: {u.userNumber || "N/A"}</p>
            <p className="text-sm text-gray-500">Role: {u.role}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => updateRole(u.uid, "ADMIN")}>Admin</button>
            <button onClick={() => updateRole(u.uid, "MODDEV")}>ModDev</button>
            <button onClick={() => updateRole(u.uid, "USER")}>Revoke</button>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface UserType {
  uid: string;
  email?: string;
  role?: "USER" | "ADMIN" | "SUPERUSER" | "MODDEV";
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
    const idToken = await user?.getIdToken();

    await fetch("/api/admin/set-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ targetUid, newRole }),
    });

    alert(`Role changed to ${newRole}`);
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
            <p>{u.email}</p>
            <p className="text-sm text-gray-500">Role: {u.role}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => updateRole(u.uid, "ADMIN")}>Make Admin</button>
            <button onClick={() => updateRole(u.uid, "MODDEV")}>Make ModDev</button>
            <button onClick={() => updateRole(u.uid, "USER")}>Revoke</button>
          </div>
        </div>
      ))}
    </div>
  );
}

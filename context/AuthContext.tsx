"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getDoc, setDoc, doc, query, where, collection, getDocs } from "firebase/firestore";

// --- Role Type ---
type UserRole = "USER" | "ADMIN" | "SUPERUSER" | "MODDEV";

// --- Extended User Interface ---
interface ExtendedUser extends User {
  role: UserRole | null;
  customUID?: string;
}

// --- Context Type ---
interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  logout: () => void;
}

// --- Create Context ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

// --- Hook ---
export const useAuth = () => useContext(AuthContext);

// --- Helper to generate unique 8-digit UID ---
const generateCustomUID = async (): Promise<string> => {
  let unique = false;
  let customUID = "";

  while (!unique) {
    customUID = Math.floor(10000000 + Math.random() * 90000000).toString();
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("customUID", "==", customUID));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      unique = true;
    }
  }

  return customUID;
};

// --- AuthProvider Component ---
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(firestore, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        let role: UserRole = "USER";
        let customUID: string | undefined;

        if (!docSnap.exists()) {
          customUID = await generateCustomUID();
          await setDoc(userRef, {
            email: firebaseUser.email,
            role,
            createdAt: new Date(),
            customUID,
          });
        }

        const data = (await getDoc(userRef)).data();
        role = data?.role || "USER";
        customUID = data?.customUID;

        const extendedUser = firebaseUser as ExtendedUser;
        extendedUser.role = role;
        extendedUser.customUID = customUID;

        setUser(extendedUser);
        setLoading(false);
        router.push("/home");
      } else {
        setUser(null);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

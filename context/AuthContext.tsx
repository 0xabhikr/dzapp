"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getDoc, setDoc, doc } from "firebase/firestore";

interface ExtendedUser extends User {
  role: "SUPERUSER" | "ADMIN" | "MODDEV" | "USER" | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(firestore, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email,
            role: "USER", // default role
            createdAt: new Date(),
          });
        }

        const data = (await getDoc(userRef)).data();
        const extendedUser: ExtendedUser = {
          ...firebaseUser,
          role: data?.role || "USER",
        };

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

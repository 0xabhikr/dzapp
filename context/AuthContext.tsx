"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  getDoc,
  setDoc,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

// Allowed roles
type UserRole = "SUPERUSER" | "USER" | "DEV" | null;

interface ExtendedUser extends User {
  role: UserRole;
  userNumber?: string;
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

async function generateUniqueUserNumber() {
  const usersRef = collection(firestore, "users");

  while (true) {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();

    const q = query(usersRef, where("userNumber", "==", randomNum));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return randomNum;
    }
  }
}

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
          const userNumber = await generateUniqueUserNumber();

          await setDoc(userRef, {
            email: firebaseUser.email,
            role: "USER", // Default role
            createdAt: new Date(),
            userNumber,
          });
        }

        const data = (await getDoc(userRef)).data();

        const extendedUser: ExtendedUser = {
          ...firebaseUser,
          role: data?.role || "USER",
          userNumber: data?.userNumber,
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

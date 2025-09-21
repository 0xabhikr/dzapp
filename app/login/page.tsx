"use client";

import { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  // Handle redirect login results (only applies to mobile redirect sign-ins)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login success");
          router.push("/home");
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      })
      .finally(() => {
        setCheckingRedirect(false);
      });
  }, [router]);

  // If already logged in, redirect
  useEffect(() => {
    if (!checkingRedirect && user) {
      router.push("/home");
    }
  }, [user, checkingRedirect, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Try again.");
    }
  };

  if (loading || checkingRedirect) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen flex justify-center items-center p-5 font-montserrat">
  <div className="w-full max-w-md bg-gray-900 bg-opacity-95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-green-600/20 relative">
    <div className="text-center mb-6">
      <img
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiByeD0iMTQiIGZpbGw9IiMxNmEzNGEiLz4KPHBhdGggZD0iTTE3LjUgMjZIMzUuNVY0NEgxNy41VjI2WiIgZmlsbD0iIzIyYzU1ZSIvPgo8cGF0aCBkPSJNMzUgNDQuNUg1Mi41VjUyLjVIMzVWNDQuNVoiIGZpbGw9IiMyMmM1NWUiLz4KPHBhdGggZD0iTTI2LjI1IDE3LjVINDMuNzVWMjUuNUgyNi4yNVYxNy41WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM1IDI2VjQ0LjVINDIuNVYzNUg1MlYyNkgzNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" 
        alt="WorldWideMods Logo"
        width={70}
        height={70}
        className="mb-4"
        style={{ display:"block" , margin:"0 auto 15px"}}
      />
      <h1 className="text-2xl font-extrabold select-none">
        <span className="text-green-500">W</span>orld
        <span className="text-green-500">W</span>ide
        <span className="text-green-500">M</span>ods
      </h1>
      <p className="text-gray-400 text-sm mt-1 select-none">
        Your global source for game mods
      </p>
    </div>

    <form onSubmit={handleLogin}>
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-green-700 to-green-500 rounded-xl text-white font-semibold text-base cursor-pointer flex justify-center items-center gap-2 select-none"
      >
        <FontAwesomeIcon icon={faGoogle} />

        Google Login
      </button>
    </form>
  </div>
</div>

  );
}

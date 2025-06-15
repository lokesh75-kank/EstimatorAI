"use client";

import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";

export function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuthContext();

  return (
    <nav className="w-full bg-white shadow-sm py-3 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-2xl font-extrabold text-blue-700 tracking-tight">Estimator AI</Link>
      </div>
      <div className="flex items-center space-x-4">
        {loading ? null : isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-700 font-medium">Dashboard</Link>
            <span className="text-gray-500">{user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-700 hover:text-blue-700 font-medium">Login</Link>
            <Link href="/register" className="text-gray-700 hover:text-blue-700 font-medium">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
} 
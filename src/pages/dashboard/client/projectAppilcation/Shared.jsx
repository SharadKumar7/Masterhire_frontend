// ─── shared.jsx ───────────────────────────────────────────────────────────────
// Shared constants, API helper, and small reusable components.
// Import from here in every section file.

import { Loader2, AlertCircle } from "lucide-react";



export const BASE_URL = import.meta.env.VITE_API_URL;
export const getToken = () => localStorage.getItem("token");

export const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Something went wrong");
  }
  return res.json();
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-teal-600">
    <Loader2 size={32} className="animate-spin" />
    <p className="font-semibold text-sm">{text}</p>
  </div>
);

// ─── Error Banner ─────────────────────────────────────────────────────────────
export const ErrorBanner = ({ message }) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 my-4 text-sm">
    <AlertCircle size={18} />
    <span>{message}</span>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ name = "", size = "md", photo = "" }) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };
  return photo ? (
    <img
      src={photo}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`${sizes[size]} rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
};
import { createClient } from "@supabase/supabase-js";

// Helper keys for local storage override testing
const LOCAL_STORAGE_URL_KEY = "medglobal_supabase_url_override";
const LOCAL_STORAGE_ANON_KEY = "medglobal_supabase_anon_override";

/**
 * Gets the active Supabase URL.
 * Prioritizes local storage developer overrides, then falls back to VITE_ environment variables, 
 * and finally defaults to the user's project URL.
 */
export function getSupabaseUrl(): string {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem(LOCAL_STORAGE_URL_KEY);
    if (override && override !== "undefined" && override !== "null" && override.trim() !== "") {
      return override;
    }
  }
  return (
    ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 
    "https://wyckaujzyfvwajwdmwpw.supabase.co"
  );
}

/**
 * Gets the active Supabase Anon Key.
 * Prioritizes local storage developer overrides, then falls back to VITE_ environment variables.
 */
export function getSupabaseAnonKey(): string {
  if (typeof window !== "undefined") {
    const override = localStorage.getItem(LOCAL_STORAGE_ANON_KEY);
    if (override && override !== "undefined" && override !== "null" && override.trim() !== "") {
      return override;
    }
  }
  return ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || "";
}

/**
 * Initializes and returns a new Supabase client instance using the current active credentials.
 */
export function getSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  
  if (!url || !key || url === "undefined" || key === "undefined" || url === "null" || key === "null" || !url.startsWith("http")) {
    return null;
  }
  
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

/**
 * Saves developer overrides to local storage for instant live browser testing.
 */
export function saveSupabaseOverrides(url: string, anonKey: string) {
  if (typeof window !== "undefined") {
    if (url) {
      localStorage.setItem(LOCAL_STORAGE_URL_KEY, url);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    }
    
    if (anonKey) {
      localStorage.setItem(LOCAL_STORAGE_ANON_KEY, anonKey);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
    }
  }
}

/**
 * Clears any active developer overrides.
 */
export function clearSupabaseOverrides() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ANON_KEY);
  }
}

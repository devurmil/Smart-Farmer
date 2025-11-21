import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const DEFAULT_BACKEND_URL = 'http://localhost:5000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBackendUrl = (): string => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000';
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    // Remove /api suffix if present since this returns the base backend URL
    return envUrl.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  return DEFAULT_BACKEND_URL;
};

export const getDefaultBackendUrl = () => DEFAULT_BACKEND_URL;

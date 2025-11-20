import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const DEFAULT_BACKEND_URL = 'https://smart-farmer-cyyz.onrender.com';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_BACKEND_URL;
};

export const getDefaultBackendUrl = () => DEFAULT_BACKEND_URL;

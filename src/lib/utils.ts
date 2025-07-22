import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'https://smart-farmer-cyyz.onrender.com';
};

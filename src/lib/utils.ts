import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBackendUrl = (): string => {
  // Always use the environment variable if set
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // For development, use production backend to maintain consistent auth
  // Users can override this by setting VITE_BACKEND_URL=http://localhost:5000 in .env
  return 'https://smart-farmer-cyyz.onrender.com';
};

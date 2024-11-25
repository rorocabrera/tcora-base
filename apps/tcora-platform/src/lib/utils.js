import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Helper function to convert HSL values to color string
export function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}
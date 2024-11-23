import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to convert HSL values to color string
export function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`
}
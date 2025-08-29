import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatPValue(pValue: number): string {
  if (pValue < 0.001) return "p < 0.001";
  if (pValue < 0.01) return `p = ${pValue.toFixed(3)}`;
  return `p = ${pValue.toFixed(3)}`;
}

export function getSignificanceColor(significant: boolean): string {
  return significant
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";
}

export function getSignificanceText(significant: boolean): string {
  return significant ? "Significant" : "Not Significant";
}

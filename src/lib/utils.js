import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize translation text by removing corrupt characters, random numbers, and HTML entities
 * @param {string} text - The translation text to sanitize
 * @returns {string} - Clean translation text
 */
export function sanitizeTranslation(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // Remove random numbers attached to words (e.g., "puji22>1" -> "puji")
  cleaned = cleaned.replace(/([a-zA-Z])\d+[>\d]*/g, '$1');

  // Remove standalone numbers with symbols (e.g., "22>1", "3...")
  cleaned = cleaned.replace(/\d+[>\d<|\\.]*/g, '');

  // Remove weird symbols and HTML-like tags
  cleaned = cleaned.replace(/[<>|\\]/g, '');

  // Remove HTML entities (e.g., &nbsp;, &#123;)
  cleaned = cleaned.replace(/&[#a-zA-Z0-9]+;/g, '');

  // Remove multiple dots (e.g., "...")
  cleaned = cleaned.replace(/\.{2,}/g, '.');

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

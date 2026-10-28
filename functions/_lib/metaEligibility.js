import { allowedZipCodes } from './serviceArea.js';

// ZIP+4 qualifies by its five-digit ZIP; malformed values still enter intake.
export function normalizeZip(value) {
  return String(value || '').trim().match(/^(\d{5})(?:-\d{4})?$/)?.[1] || '';
}

export function isMetaEligible(value) {
  return allowedZipCodes.has(normalizeZip(value));
}

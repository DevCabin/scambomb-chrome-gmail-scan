// API Types for ScamBomb Gmail Extension

export interface ScanRequest {
  sender: string;
  body: string;
  context: string; // Additional context like "Gmail extension scan; subject: ..."
}

export interface ScanResponse {
  text: string; // Full AI analysis explanation
  verdict: 'SAFE' | 'UNSAFE' | 'UNKNOWN';
  threatLevel: string; // Percentage like "75%"
}

export interface ScanError {
  error: string;
  code?: number;
}

// Internal types for the extension
export interface EmailData {
  sender: string;
  subject: string;
  body: string;
  context: string;
}

export interface ScanResult {
  request: ScanRequest;
  response?: ScanResponse;
  error?: ScanError;
  timestamp: number;
}

// Modal states
export type ModalState = 'loading' | 'success' | 'error' | 'hidden';

// Verdict colors for UI
export const VERDICT_COLORS = {
  SAFE: '#22c55e',    // Green
  UNSAFE: '#ef4444',  // Red
  UNKNOWN: '#f59e0b'  // Amber
} as const;

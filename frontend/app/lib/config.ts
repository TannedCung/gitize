// API Configuration with environment-aware URL resolution

/**
 * Get the appropriate API base URL based on the environment and context
 * - In browser: Use the current origin or configured public URL
 * - In server (SSR): Use internal service URL when available
 */
export function getApiBaseUrl(): string {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Browser environment - use the configured public URL or current origin
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;

    if (publicUrl) {
      return publicUrl;
    }

    // Fallback to current origin (works with nginx proxy)
    return window.location.origin;
  }

  // Server environment (SSR) - use internal service URL if available
  const internalUrl = process.env.INTERNAL_API_URL;
  if (internalUrl) {
    return internalUrl;
  }

  // Fallback to public URL for SSR
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
}

/**
 * Get the full API URL with /api prefix
 */
export function getApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
}

// Export for backward compatibility
export const API_BASE_URL = getApiBaseUrl();

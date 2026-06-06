/**
 * Auth configuration - Frontend only handles JWT token management
 * Google OAuth is processed entirely in the Go backend
 */
import { authCookies } from "@/lib/cookies";

/**
 * Get the auth headers for API requests
 */
export function getAuthHeaders() {
  const token = authCookies.getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Initiate Google OAuth flow with Go backend
 * 
 * Flow:
 * 1. Frontend redirects user to backend's OAuth login endpoint
 * 2. Backend redirects to Google OAuth consent
 * 3. User authenticates with Google
 * 4. Google redirects back to backend's callback endpoint
 * 5. Backend exchanges code for token, saves user, generates JWT
 * 6. Backend redirects back to frontend with token in URL/cookies
 */
export function initiateGoogleOAuth() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const oauthLoginUri = process.env.NEXT_PUBLIC_OAUTH_LOGIN_URI;
  const oauthUrl = `${backendUrl}${oauthLoginUri}`;
  
  // Redirect to Go backend's OAuth login endpoint
  if (typeof window !== "undefined") {
    window.location.href = oauthUrl;
  }
}

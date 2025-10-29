import axios from 'axios';

let accessTokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * Gets a fresh Spotify access token using the refresh token.
 * Automatically caches it until expiry.
 */
export async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid
  if (accessTokenCache.token && now < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  });

  const basicAuth = Buffer
    .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
    .toString('base64');

  try {
    const response = await axios.post(tokenUrl, body, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;

    // Cache token for its duration (Spotify gives expires_in in seconds)
    accessTokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in - 60) * 1000 // refresh 1 min before expiry
    };

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error.response?.data || error.message);
    throw new Error('Failed to refresh Spotify access token');
  }
}

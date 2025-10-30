/**
 * Spotify API Configuration
 * Centralized configuration for all Spotify API endpoints and constants
 */

// Base URLs
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com/api';

// Authentication endpoints
export const SPOTIFY_AUTH_ENDPOINTS = {
  TOKEN: `${SPOTIFY_ACCOUNTS_BASE}/token`
};

// Web API endpoints
export const SPOTIFY_API_ENDPOINTS = {
  // Player endpoints
  CURRENTLY_PLAYING: `${SPOTIFY_API_BASE}/me/player/currently-playing`,
  PLAYER_STATE: `${SPOTIFY_API_BASE}/me/player`,
  
  // User's top items
  TOP_TRACKS: `${SPOTIFY_API_BASE}/me/top/tracks`,
  TOP_ARTISTS: `${SPOTIFY_API_BASE}/me/top/artists`,
  
  // User profile
  USER_PROFILE: `${SPOTIFY_API_BASE}/me`,
  
  // Playlists
  USER_PLAYLISTS: `${SPOTIFY_API_BASE}/me/playlists`,
  PLAYLIST: (playlistId) => `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
  
  // Recently played
  RECENTLY_PLAYED: `${SPOTIFY_API_BASE}/me/player/recently-played`,
  
  // Search
  SEARCH: `${SPOTIFY_API_BASE}/search`
};

// Time range constants for top items
export const TIME_RANGES = {
  SHORT_TERM: 'short_term',   // ~4 weeks
  MEDIUM_TERM: 'medium_term', // ~6 months
  LONG_TERM: 'long_term'      // ~several years
};

// Valid time ranges array for validation
export const VALID_TIME_RANGES = Object.values(TIME_RANGES);

// Limit constants
export const LIMITS = {
  MIN: 1,
  MAX: 50,
  DEFAULT_TRACKS: 5,
  DEFAULT_ARTISTS: 5,
  DEFAULT_PLAYLISTS: 5
};

// HTTP Status codes commonly used with Spotify API
export const SPOTIFY_STATUS_CODES = {
  NO_CONTENT: 204,  // No song currently playing
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Content types
export const CONTENT_TYPES = {
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  JSON: 'application/json'
};

// Grant types for OAuth
export const GRANT_TYPES = {
  REFRESH_TOKEN: 'refresh_token',
  AUTHORIZATION_CODE: 'authorization_code'
};